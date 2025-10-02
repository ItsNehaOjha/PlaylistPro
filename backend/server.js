const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Enhanced error logging for production
const logError = (error, req = null) => {
  console.error('🚨 Error occurred:', {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    url: req ? req.url : undefined,
    method: req ? req.method : undefined,
    ip: req ? req.ip : undefined
  });
};

// Middleware
// CORS configuration for production
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add compression middleware
const compression = require('compression');
app.use(compression());

// Request logging middleware for production debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/playlists', require('./routes/playlistRoutes'));
app.use('/api/scheduler', require('./routes/schedulerRoutes'));

// Health check route for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'PlaylistPro Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 10000
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'PlaylistPro API is running!',
    version: '1.0.0',
    endpoints: ['/api/auth', '/api/playlists', '/api/scheduler'],
    health: '/health'
  });
});

// Enhanced error handling middleware with production logging
app.use((err, req, res, next) => {
  logError(err, req);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 10000;

// Bind to 0.0.0.0 for Render deployment
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🌐 CORS Origin: ${process.env.FRONTEND_URL || 'http://localhost:5174'}`);
});


