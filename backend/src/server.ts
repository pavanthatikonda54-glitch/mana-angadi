import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import router from './routes/index.js';
import { initializeSchema } from './models/schema.js';
import { db } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'MaNa Angadi E-Commerce Platform API',
    tagline: 'Mana Ooru Shopping, Mana Angadi.',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', router);

// 404 Route handler
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found on MaNa Angadi server.`
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred. Please try again later.'
  });
});

// Start Server & verify DB schema
async function startServer() {
  try {
    await initializeSchema();
    
    // Check if database needs seeding
    const userCount = await db.getOne('SELECT COUNT(*) as cnt FROM users');
    if (!userCount || userCount.cnt === 0) {
      console.log('Database is empty. Running auto-seed...');
      const { runSeed } = await import('./seed/seedData.js');
      await runSeed();
    }

    app.listen(PORT, () => {
      console.log(`🚀 MaNa Angadi Backend API is running on http://localhost:${PORT}`);
      console.log(`✨ Tagline: Mana Ooru Shopping, Mana Angadi.`);
      console.log(`🛒 Mode: Development & Test Payment Ready`);
    });
  } catch (err) {
    console.error('Failed to initialize and start server:', err);
    process.exit(1);
  }
}

startServer();
