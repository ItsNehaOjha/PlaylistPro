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

// Middleware - CORS only in development
if (process.env.NODE_ENV !== "production") {
  app.use(cors({
    origin: "http://localhost:3000"
  }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/playlists', require('./routes/playlistRoutes'));
app.use('/api/scheduler', require('./routes/schedulerRoutes'));

// Serve static files from the React app build directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
} else {
  // Basic route for testing in development
  app.get('/', (req, res) => {
    res.json({ message: 'PlaylistPro API' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  }
});

// Set server timeouts for Render deployment
server.keepAliveTimeout = 120000; // 120 seconds
server.headersTimeout = 120000; // 120 seconds
