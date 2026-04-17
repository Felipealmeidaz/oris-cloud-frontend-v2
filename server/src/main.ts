import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node';
import { auth } from './lib/auth';

config();

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

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

// CORS
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Better Auth routes
app.all('/api/auth/*', toNodeHandler(auth));

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
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`🔒 Security: Helmet enabled`);
  console.log(`🔗 Frontend: ${FRONTEND_URL}`);
  console.log(`📍 Health check: GET /api/health`);
  console.log(`🔐 Auth: GET /api/auth/session`);
});
