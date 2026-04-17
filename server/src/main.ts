import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/v1/auth/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// API Routes
app.get('/api/v1/users', (req, res) => {
  res.json({ message: 'Users endpoint' });
});

app.post('/api/v1/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

app.post('/api/v1/auth/register', (req, res) => {
  res.json({ message: 'Register endpoint' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📝 API docs: http://localhost:${PORT}/api/docs`);
  console.log(`🔗 Frontend: ${FRONTEND_URL}`);
});
