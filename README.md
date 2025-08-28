# SkillLog

A comprehensive web application to help students track their learning progress, manage multiple YouTube playlists, scheduling, and more.

## ✨ Features

### ✅ **Currently Available**
- **Multi-Playlist Support**: Add unlimited YouTube playlists per user
- **User Authentication**: Secure JWT-based login/registration system
- **Progress Tracking**: Track video completion with day-wise organization
- **Real-time Updates**: Progress saved instantly to MongoDB database
- **Private Video Handling**: Automatically detects unavailable videos
- **Dark/Light Mode**: Theme toggle with persistent preferences

### 🚧 **Coming Soon**
- **Dynamic Scheduler**: Adaptive study session planning
- **Quiz Generator**: Practice quiz creation and testing
- **Progress Analytics**: Detailed progress insights and statistics
- **To-Do + Notes**: Task management and note-taking system

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** with **Mongoose ORM** - Database and data modeling
- **JWT Authentication** - Secure user sessions
- **bcrypt** - Password hashing and security
- **Axios** - HTTP client for YouTube API integration
- **CORS** - Cross-origin resource sharing
- **Express Validator** - Input validation and sanitization

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tooling and development server
- **Material-UI (MUI)** - Professional component library
- **React Router** - Client-side routing
- **Context API** - Global state management
- **Axios** - HTTP client for API communication

## 📁 Project Structure

```
skillLog/
├── backend/                 # Node.js + Express backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers (auth, playlists)
│   ├── middleware/         # Authentication middleware
│   ├── models/             # Mongoose models (User, Playlist)
│   ├── routes/             # API routes (auth, playlists)
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── index.html          # HTML template
│   ├── vite.config.js      # Vite configuration
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- YouTube Data API v3 key
- npm or yarn package manager

### 1. Clone the repository
```bash
git clone <repository-url>
cd skillLog
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env
# Edit .env with your configuration:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/learnlog
# JWT_SECRET=your_secure_jwt_secret_here
# NODE_ENV=development
# YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp env.example .env
# Edit .env with your configuration:
# VITE_API_URL=http://localhost:5000/api
# REACT_APP_YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here

# Start development server
npm run dev
```

## 🔑 YouTube API Setup

1. **Google Cloud Console**: Visit [console.cloud.google.com](https://console.cloud.google.com/)
2. **Create Project**: Create a new project or select existing one
3. **Enable API**: Enable YouTube Data API v3
4. **Create Credentials**: Generate an API key
5. **Add to Environment**: Include the key in both `.env` files

## 🌐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/learnlog
JWT_SECRET=your_secure_jwt_secret_here
NODE_ENV=development
YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
REACT_APP_YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Playlists
- `POST /api/playlists` - Create new playlist (protected)
- `GET /api/playlists` - Get user's playlists (protected)
- `PATCH /api/playlists/:playlistId` - Update video progress (protected)
- `DELETE /api/playlists/:playlistId` - Delete playlist (protected)

## 💾 Database Models

### User Model
- `name`, `email`, `password` (hashed)
- Timestamps and password comparison methods

### Playlist Model
- `userId`, `playlistId`, `title`
- `videos[]` array with completion tracking
- `videosPerDay`, progress statistics
- Virtual fields for completion percentage

## 🎯 Usage

1. **Start Services**: Ensure MongoDB, backend, and frontend are running
2. **Access Application**: Open http://localhost:3000 in your browser
3. **User Registration**: Create an account with email/password
4. **Add Playlists**: Paste YouTube playlist URLs to start tracking
5. **Track Progress**: Mark videos as complete/incomplete
6. **Monitor Progress**: View completion statistics and day-wise organization

## 🔒 Security Features

- **JWT Authentication**: Secure token-based sessions
- **Password Hashing**: bcrypt with salt rounds
- **Protected Routes**: Authentication middleware for sensitive endpoints
- **Input Validation**: Express-validator for data sanitization
- **CORS Configuration**: Controlled cross-origin access

## 🎨 UI/UX Features

- **Responsive Design**: Mobile and desktop optimized
- **Theme Toggle**: Dark/light mode with persistent preferences
- **Material Design**: Professional Material-UI components
- **Progress Visualization**: Progress bars and completion statistics
- **Intuitive Navigation**: Tab-based playlist management

## 🚧 Development

### Backend Development
- Server runs on port 5000 by default
- Uses nodemon for automatic restart on file changes
- MongoDB connection with comprehensive error handling
- JWT token expiration: 30 days

### Frontend Development
- Development server runs on port 3000
- Hot module replacement enabled
- Material-UI theme customization
- Responsive design for all devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions, issues, or feature requests:
- Open an issue in the repository
- Check the troubleshooting section in `setup.md`
- Review the console logs for error details

## 🔄 Updates & Roadmap

- **v1.0**: Multi-playlist support with user authentication ✅
- **v1.1**: Enhanced progress analytics and reporting
- **v1.2**: Dynamic scheduling and study planning
- **v1.3**: Quiz generation and assessment tools
- **v2.0**: Advanced analytics and machine learning insights
