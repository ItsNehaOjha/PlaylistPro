const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  dayNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completionDate: {
    type: Date,
    default: null,
  },
  originalIndex: {
    type: Number,
    required: true,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  thumbnail: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: '',
  },
}, {
  timestamps: true
});

const playlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  playlistId: {
    type: String,
    required: false, // Not required for manual sources
  },
  title: {
    type: String,
    required: true,
  },
  trackerTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Tracker title cannot be more than 100 characters']
  },
  sourceType: {
    type: String,
    enum: ['youtube', 'manual'],
    default: 'youtube',
    required: true,
  },
  videos: [videoSchema],
  videosPerDay: {
    type: Number,
    default: 5,
  },
  totalVideos: {
    type: Number,
    default: 0,
  },
  availableVideos: {
    type: Number,
    default: 0,
  },
  privateVideos: {
    type: Number,
    default: 0,
  },
  lastFetched: {
    type: Date,
    default: Date.now,
  },
  // Manual source specific fields
  manualTotalVideos: {
    type: Number,
    default: 0,
  },
  completedVideos: [{
    videoIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true
});

// Compound index to ensure unique playlists per user (only for YouTube)
playlistSchema.index({ userId: 1, playlistId: 1 }, { 
  unique: true, 
  sparse: true // Allows null/undefined values
});

// Virtual for completion stats (works for both YouTube and manual)
playlistSchema.virtual('completedVideosCount').get(function() {
  if (this.sourceType === 'manual') {
    return this.completedVideos ? this.completedVideos.length : 0;
  }
  return this.videos ? this.videos.filter(video => video.completed && !video.isPrivate).length : 0;
});

playlistSchema.virtual('completionPercentage').get(function() {
  if (this.sourceType === 'manual') {
    if (this.manualTotalVideos === 0) return 0;
    return Math.round(((this.completedVideos ? this.completedVideos.length : 0) / this.manualTotalVideos) * 100);
  }
  
  if (this.availableVideos === 0) return 0;
  return Math.round((this.completedVideosCount / this.availableVideos) * 100);
});

// Ensure virtual fields are serialized
playlistSchema.set('toJSON', { virtuals: true });
playlistSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Playlist', playlistSchema);
