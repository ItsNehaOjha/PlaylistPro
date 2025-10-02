# 🎯 PlaylistPro - Smart Learning Progress Tracker

<div align="center">
  <img src="https://github.com/ItsNehaOjha/PlaylistPro/blob/main/screenshot.png" alt="PlaylistPro Dashboard" width="800"/>
  
  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-00D4FF?style=for-the-badge&logo=vercel)](https://playlistpro.onrender.com/)
  [![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/ItsNehaOjha/PlaylistPro)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
</div>

## 📖 Overview

**PlaylistPro** is a comprehensive learning progress tracker that transforms your YouTube playlists into structured learning paths. Master your exam preparation with organized study playlists, intelligent progress tracking, and smart scheduling. Turn YouTube videos into structured learning experiences with day-wise organization and detailed analytics.

### 🌟 **Live Demo**
- **Frontend**: [https://playlistpro.onrender.com/](https://playlistpro.onrender.com/)
- **GitHub Repository**: [https://github.com/ItsNehaOjha/PlaylistPro](https://github.com/ItsNehaOjha/PlaylistPro)

---

## ✨ Key Features

### 🎯 **Core Functionality**
- **Multi-Playlist Management**: Track unlimited YouTube playlists and manual learning content
- **Smart Progress Tracking**: Mark videos/items as complete with persistent storage
- **Day-wise Organization**: Automatically group content into manageable daily study sessions
- **Dual Source Support**: Both YouTube playlists and manual content trackers
- **Real-time Analytics**: Live progress statistics and completion insights
- **Cold Start Resilience**: Automatic retry logic with exponential backoff for robust API calls

### 🔐 **User Management**
- **Secure Authentication**: JWT-based login/registration system with bcrypt password hashing
- **Personal Dashboard**: Futuristic dashboard with dynamic progress insights
- **User-specific Data**: All progress tied to individual user accounts with MongoDB storage
- **Password Security**: Secure password reset functionality with email integration

### 📊 **Progress Analytics**
- **Completion Statistics**: Track videos completed, days finished, overall percentage
- **Study Streak Tracking**: Monitor consecutive study days and learning momentum
- **Study Time Calculation**: Automatic time tracking from session data
- **Completed Playlists Counter**: Track fully completed learning paths
- **Visual Progress Indicators**: Progress bars, completion badges, and motivational feedback

### 🎨 **User Experience**
- **Modern UI**: Material-UI components with futuristic dark theme design
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Intuitive Navigation**: Tab-based playlist management with smooth transitions
- **Real-time Notifications**: React Hot Toast for instant feedback and updates
- **Loading States**: Elegant loading spinners and skeleton screens

---

## 🏗️ Technology Stack

### **Backend Technologies**
- **Node.js** + **Express.js** - RESTful API server with middleware support
- **MongoDB** with **Mongoose** - Document database with schema validation
- **JWT Authentication** - Secure stateless authentication system
- **YouTube Data API v3** - Real-time playlist and video data fetching
- **bcryptjs** - Password hashing and security
- **Express Validator** - Input validation and sanitization
- **Nodemailer** - Email services for password reset functionality
- **Axios** - HTTP client for external API calls
- **CORS** - Cross-origin resource sharing configuration
- **Compression** - Response compression for better performance

### **Frontend Technologies**
- **React 18** - Modern React with hooks, context, and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Material-UI (MUI)** - Professional component library with theming
- **React Router v6** - Client-side routing and navigation
- **Axios** - HTTP client with retry logic and interceptors
- **React Hot Toast** - Beautiful notification system
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Emotion** - CSS-in-JS styling solution

### **DevOps & Deployment**
- **Render** - Cloud hosting platform for both frontend and backend
- **UptimeRobot** - Keep-alive monitoring to prevent cold starts
- **Environment Variables** - Secure configuration management
- **Git** - Version control with GitHub integration

---

## 🚀 Quick Start Guide

### **Prerequisites**
- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher)
- MongoDB (local installation or cloud instance)
- YouTube Data API v3 key from Google Cloud Console

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/ItsNehaOjha/PlaylistPro.git
cd PlaylistPro
```

### **Step 2: Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env
```

**Configure Backend Environment Variables** (`.env`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/playlistpro
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
NODE_ENV=development
YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
FRONTEND_URL=http://localhost:5174
```

### **Step 3: Frontend Setup**
```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp env.example .env
```

**Configure Frontend Environment Variables** (`.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### **Step 4: Start Development Servers**

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend Server:**
```bash
cd frontend
npm run dev
```

### **Step 5: Access Your Application**
- **Frontend**: [http://localhost:5174](http://localhost:5174)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 🌐 Production Deployment

### **Deploy to Render (Recommended)**

#### **Backend Deployment**
1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure build settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables in Render dashboard
5. Deploy and note your backend URL

#### **Frontend Deployment**
1. Create a new Static Site on Render
2. Connect the same GitHub repository
3. Configure build settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add environment variables:
   - `VITE_API_URL`: Your backend URL + `/api`
5. Deploy your frontend

#### **Keep-Alive Setup (Prevent Cold Starts)**
1. Sign up for [UptimeRobot](https://uptimerobot.com) (free)
2. Create a new HTTP monitor
3. Set URL to: `https://your-backend-url.onrender.com/ping`
4. Set monitoring interval to 5 minutes
5. This keeps your backend warm and prevents cold starts

---

## 🔑 YouTube API Setup

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the API key and add it to your environment variables
6. (Optional) Restrict the API key to YouTube Data API for security

---

## 📱 How to Use PlaylistPro

### **Getting Started**
1. **Sign Up**: Create your account with email and secure password
2. **Login**: Access your personal dashboard
3. **Add Playlists**: Paste YouTube playlist URLs to import content
4. **Track Progress**: Mark videos as complete as you study
5. **Monitor Analytics**: View your learning statistics and streaks

### **Key Workflows**
- **Import Playlist**: Copy any public YouTube playlist URL and paste it
- **Daily Study**: Videos are automatically organized into daily study sessions
- **Progress Tracking**: Click checkmarks to mark videos as completed
- **Analytics Review**: Check your dashboard for completion statistics
- **Multi-Playlist**: Manage multiple learning paths simultaneously

---

## 🛠️ Development

### **Project Structure**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Neha Ojha**
- GitHub: [@ItsNehaOjha](https://github.com/ItsNehaOjha)
- LinkedIn: [Connect with me](https://linkedin.com/in/nehaojha)

---

## 🙏 Acknowledgments

- YouTube Data API v3 for playlist data
- Material-UI for beautiful components
- Render for reliable hosting
- MongoDB for flexible data storage
- All contributors and users of PlaylistPro

---

<div align="center">
  <p>Made with ❤️ for learners worldwide</p>
  <p>
    <a href="https://playlistpro.onrender.com/">🚀 Try PlaylistPro Now</a> |
    <a href="https://github.com/ItsNehaOjha/PlaylistPro/issues">🐛 Report Bug</a> |
    <a href="https://github.com/ItsNehaOjha/PlaylistPro/issues">💡 Request Feature</a>
  </p>
</div>
