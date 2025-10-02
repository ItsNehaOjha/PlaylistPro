const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// Enable CORS for production with proper frontend URL
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: [process.env.FRONTEND_URL || 'https://playlistpro.onrender.com'],
    credentials: true
  }));
} else {
  app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:4173"],
    credentials: true
  }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add compression middleware for faster responses
const compression = require('compression');
app.use(compression());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/playlists', require('./routes/playlistRoutes'));
app.use('/api/scheduler', require('./routes/schedulerRoutes'));

// Serve Static Frontend in Production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, '../frontend/dist'), {
    maxAge: '1y', // Cache static files for 1 year
    etag: false
  }));

  // Catch-all handler: send back React's index.html file for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
} else {
  // Basic route for testing in development
  app.get('/', (req, res) => {
    res.json({ message: 'PlaylistPro API is running!' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

// CRITICAL: Bind to 0.0.0.0 for Render deployment
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 App available at https://playlistpro.onrender.com`);
  } else {
    console.log(`📱 Frontend should run on http://localhost:3000`);
    console.log(`🔗 API available at http://localhost:${PORT}`);
  }
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});


