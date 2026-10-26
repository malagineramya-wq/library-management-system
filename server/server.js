import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { seedInitialData } from './config/seeder.js';

import bookRoutes from './routes/bookRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Base route for API health check
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Library Management System REST API is running smoothly.',
  });
});

// Serve frontend static build assets from client/dist if present
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// For any non-API route, send back the React index.html
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// 404 handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Start server after connecting to database
const startServer = async () => {
  try {
    await connectDB();
    await seedInitialData();

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  Library Management System Server Running     `);
      console.log(`  Full-Stack App: http://localhost:${PORT}      `);
      console.log(`  API Endpoint:   http://localhost:${PORT}/api  `);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
