# PlaylistPro

A comprehensive learning progress tracker that helps students and professionals manage their YouTube playlists and manual learning content with intelligent progress tracking, day-wise organization, and detailed analytics.

## ✨ Key Features

### 🎯 **Core Functionality**
- **Multi-Playlist Management**: Track unlimited YouTube playlists and manual learning content
- **Smart Progress Tracking**: Mark videos/items as complete with persistent storage
- **Day-wise Organization**: Automatically group content into manageable daily study sessions
- **Dual Source Support**: Both YouTube playlists and manual content trackers
- **Real-time Analytics**: Live progress statistics and completion insights

### 🔐 **User Management**
- **Secure Authentication**: JWT-based login/registration system
- **Personal Dashboard**: Futuristic dashboard with dynamic progress insights
- **User-specific Data**: All progress tied to individual user accounts
- **Password Security**: bcrypt hashing with secure password reset

### 📊 **Progress Analytics**
- **Completion Statistics**: Track videos completed, days finished, overall percentage
- **Study Streak Tracking**: Monitor consecutive study days
- **Study Time Calculation**: Automatic time tracking from session data
- **Completed Playlists Counter**: Track fully completed learning paths

### 🎨 **User Experience**
- **Modern UI**: Material-UI components with dark/light theme support
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Intuitive Navigation**: Tab-based playlist management with smooth transitions
- **Visual Progress**: Progress bars, completion indicators, and motivational feedback

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API server
- **MongoDB** with **Mongoose** - Document database with schema validation
- **JWT Authentication** - Secure stateless authentication
- **YouTube Data API v3** - Real-time playlist and video data fetching
- **bcrypt** - Password hashing and security
- **Express Validator** - Input validation and sanitization
- **Nodemailer** - Email services for password reset

### Frontend
- **React 18** - Modern React with hooks and context
- **Vite** - Lightning-fast build tool and dev server
- **Material-UI (MUI)** - Professional component library
- **React Router v6** - Client-side routing and navigation
- **Axios** - HTTP client for API communication
- **React Hot Toast** - Beautiful notification system



# Quick Setup Guide for PlaylistPro Multi-Playlist Support

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/learnlog
JWT_SECRET=your_super_secret_jwt_key_123
NODE_ENV=development
YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
```

### Step 2: Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in frontend folder:
```env
VITE_API_URL=http://localhost:5000/api
REACT_APP_YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
```

### Step 3: Start Both Servers

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## 🌐 Access Your App
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📝 Test the Multi-Playlist Features
1. Open http://localhost:3000
2. Click "Sign Up" to create an account
3. Login with your credentials
4. Navigate to "Playlists" from the dashboard
5. Add your first YouTube playlist URL
6. Watch as videos are automatically organized by day
7. Track your progress across multiple playlists!

## ⚠️ Important Notes
- **MongoDB Required**: Make sure MongoDB is running on your system
- **YouTube API Key**: Required for fetching playlist data (get one from Google Cloud Console)
- **Backend Port**: 5000, Frontend Port: 3000
- **JWT Authentication**: Tokens expire in 30 days
- **Password Security**: All passwords are hashed with bcrypt
- **Multi-User Support**: Each user has their own playlists and progress

## 🔑 YouTube API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add the API key to both `.env` files

## 🐛 Troubleshooting
- **Backend fails to start**: Check MongoDB connection and YouTube API key
- **Frontend can't connect**: Verify backend is running on port 5000
- **Playlist fetch fails**: Check YouTube API key and quota limits
- **Database errors**: Ensure MongoDB is running and accessible
- **Check console**: Look for error messages in browser and terminal

## ✨ New Features
- **Multi-Playlist Support**: Add unlimited YouTube playlists
- **Per-User Storage**: Each user has their own playlists and progress
- **Real-time Updates**: Progress saved instantly to database
- **Day-wise Organization**: Videos automatically grouped by study days
- **Progress Tracking**: Visual progress bars and completion stats
- **Private Video Handling**: Automatically detects and marks unavailable videos
