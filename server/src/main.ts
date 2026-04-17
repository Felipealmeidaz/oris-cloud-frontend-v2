import 'reflect-metadata';
import express from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node';
import { auth } from './lib/auth';

config();

const app = express();
const PORT = process.env.PORT || 8080;

// CORS allowed origins (string exact match or RegExp pattern)
const EXTRA_ORIGINS = (process.env.EXTRA_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const ALLOWED_ORIGINS: Array<string | RegExp> = [
  'https://oriscloud.com.br',
  'https://www.oriscloud.com.br',
  /\.vercel\.app$/,
  /\.up\.railway\.app$/,
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  ...EXTRA_ORIGINS,
];

// Middleware
// Security: Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}));

// CORS with whitelist validation
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests without origin header (server-to-server, curl, Postman)
    if (!origin) return callback(null, true);
    const isAllowed = ALLOWED_ORIGINS.some(allowed =>
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    );
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: origin '${origin}' not in whitelist`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Better Auth routes (MUST come BEFORE express.json() - needs raw body)
app.all('/api/auth/*', toNodeHandler(auth));

// Body parsers (AFTER auth handler)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running', timestamp: new Date().toISOString() });
});

app.get('/api/v1/auth/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Get current user
app.get('/api/v1/users/me', async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.json(session.user);
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// API Routes
app.get('/api/v1/users', (req, res) => {
  res.json({ message: 'Users endpoint' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Security: Helmet enabled`);
  console.log(`CORS allowed origins: ${ALLOWED_ORIGINS.length} entries`);
  console.log(`Health check: GET /api/health`);
  console.log(`Auth: GET /api/auth/session`);
});
