const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  playlistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
    required: true,
    index: true
  },
  sessionName: {
    type: String,
    required: [true, 'Session name is required'],
    trim: true,
    maxlength: [100, 'Session name cannot be more than 100 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  dailyAllocation: {
    type: Number,
    required: true,
    min: [1, 'Daily allocation must be at least 1']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  completedDays: [{
    date: {
      type: Date,
      required: true
    },
    videosCompleted: {
      type: Number,
      default: 0
    }
  }],
  missedDays: [{
    date: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

// Compound index on userId and playlistId
studySessionSchema.index({ userId: 1, playlistId: 1 });

// Virtual for calculating remaining days
studySessionSchema.virtual('remainingDays').get(function() {
  const today = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for calculating total days
studySessionSchema.virtual('totalDays').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
});

// Virtual for calculating progress percentage
studySessionSchema.virtual('progressPercentage').get(function() {
  const totalDays = this.totalDays;
  const completedDaysCount = this.completedDays.length;
  return Math.round((completedDaysCount / totalDays) * 100);
});

// Method to calculate daily allocation
studySessionSchema.methods.calculateDailyAllocation = async function() {
  const Playlist = require('./Playlist');
  
  // Get playlist to know total videos
  const playlist = await Playlist.findById(this.playlistId);
  if (!playlist) {
    throw new Error('Playlist not found');
  }

  const totalVideos = playlist.sourceType === 'manual' 
    ? playlist.manualTotalVideos 
    : playlist.availableVideos;

  const remainingDays = this.remainingDays;
  
  if (remainingDays <= 0) {
    this.dailyAllocation = totalVideos;
  } else {
    this.dailyAllocation = Math.ceil(totalVideos / remainingDays);
  }
  
  return this.dailyAllocation;
};

// Method to recalculate allocation after missed days
studySessionSchema.methods.recalculateAllocation = async function() {
  const Playlist = require('./Playlist');
  
  // Get playlist to know total videos
  const playlist = await Playlist.findById(this.playlistId);
  if (!playlist) {
    throw new Error('Playlist not found');
  }

  const totalVideos = playlist.sourceType === 'manual' 
    ? playlist.manualTotalVideos 
    : playlist.availableVideos;

  // Calculate completed videos
  const completedVideos = this.completedDays.reduce((total, day) => {
    return total + day.videosCompleted;
  }, 0);

  const remainingVideos = Math.max(0, totalVideos - completedVideos);
  const remainingDays = this.remainingDays;
  
  if (remainingDays <= 0) {
    this.dailyAllocation = remainingVideos;
  } else {
    this.dailyAllocation = Math.ceil(remainingVideos / remainingDays);
  }
  
  return this.dailyAllocation;
};

// Pre-save middleware to ensure daily allocation is calculated
studySessionSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('endDate') || this.isModified('playlistId')) {
    try {
      await this.calculateDailyAllocation();
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Ensure virtuals are included in JSON output
studySessionSchema.set('toJSON', { virtuals: true });
studySessionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('StudySession', studySessionSchema);
