const StudySession = require('../models/StudySession');
const Playlist = require('../models/Playlist');

// @desc    Create new study session
// @route   POST /api/scheduler/session
// @access  Private
const createStudySession = async (req, res) => {
  try {
    const { playlistId, sessionName, startDate, endDate } = req.body;
    const userId = req.user._id;

    // Validate playlist exists and belongs to user
    const playlist = await Playlist.findOne({ _id: playlistId, userId });
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (start < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Create study session
    const studySession = new StudySession({
      userId,
      playlistId,
      sessionName,
      startDate: start,
      endDate: end
    });

    // Calculate daily allocation
    await studySession.calculateDailyAllocation();

    const savedSession = await studySession.save();

    // Populate playlist details
    await savedSession.populate('playlistId', 'title sourceType availableVideos manualTotalVideos');

    res.status(201).json({
      success: true,
      data: savedSession,
      message: 'Study session created successfully'
    });
  } catch (error) {
    console.error('Error creating study session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all study sessions for a user
// @route   GET /api/scheduler/sessions/:userId
// @access  Private
const getUserStudySessions = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user._id;

    // Ensure user can only access their own sessions
    if (userId !== requestingUserId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access these sessions' });
    }

    const sessions = await StudySession.find({ userId })
      .populate('playlistId', 'title sourceType availableVideos manualTotalVideos completedVideos')
      .sort({ createdAt: -1 });

    // Calculate progress percentage for each session based on playlist completion
    const sessionsWithProgress = sessions.map(session => {
      const playlist = session.playlistId;
      let progressPercentage = 0;
      
      if (playlist) {
        const totalVideos = playlist.sourceType === 'manual' 
          ? playlist.manualTotalVideos 
          : playlist.availableVideos;
        
        const completedVideos = playlist.completedVideos ? playlist.completedVideos.length : 0;
        
        if (totalVideos > 0) {
          progressPercentage = Math.round((completedVideos / totalVideos) * 100);
        }
      }
      
      return {
        ...session.toObject(),
        progressPercentage
      };
    });

    res.json({
      success: true,
      data: sessionsWithProgress,
      count: sessionsWithProgress.length
    });
  } catch (error) {
    console.error('Error fetching study sessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update study session
// @route   PUT /api/scheduler/session/:id
// @access  Private
const updateStudySession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { sessionName, startDate, endDate, status, missedDays } = req.body;

    // Find session and ensure it belongs to user
    const session = await StudySession.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    // Update fields if provided
    if (sessionName !== undefined) session.sessionName = sessionName;
    if (startDate !== undefined) session.startDate = new Date(startDate);
    if (endDate !== undefined) session.endDate = new Date(endDate);
    if (status !== undefined) session.status = status;
    if (missedDays !== undefined) session.missedDays = missedDays;

    // Validate dates if being updated
    if (startDate || endDate) {
      const start = session.startDate;
      const end = session.endDate;
      const today = new Date();

      if (start < today) {
        return res.status(400).json({ message: 'Start date cannot be in the past' });
      }

      if (end <= start) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }

    // Recalculate daily allocation if dates changed or missed days added
    if (startDate || endDate || missedDays) {
      await session.recalculateAllocation();
    }

    const updatedSession = await session.save();

    // Populate playlist details
    await updatedSession.populate('playlistId', 'title sourceType availableVideos manualTotalVideos');

    res.json({
      success: true,
      data: updatedSession,
      message: 'Study session updated successfully'
    });
  } catch (error) {
    console.error('Error updating study session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete study session
// @route   DELETE /api/scheduler/session/:id
// @access  Private
const deleteStudySession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find session and ensure it belongs to user
    const session = await StudySession.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    await StudySession.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Study session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting study session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark day as completed
// @route   POST /api/scheduler/session/:id/complete-day
// @access  Private
const completeDay = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { date, videosCompleted } = req.body;

    // Find session and ensure it belongs to user
    const session = await StudySession.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    // Check if day is already completed
    const existingDay = session.completedDays.find(day => 
      day.date.toDateString() === new Date(date).toDateString()
    );

    if (existingDay) {
      return res.status(400).json({ message: 'Day already marked as completed' });
    }

    // Add completed day
    session.completedDays.push({
      date: new Date(date),
      videosCompleted: videosCompleted || 0
    });

    // Recalculate allocation
    await session.recalculateAllocation();

    const updatedSession = await session.save();

    // Populate playlist details
    await updatedSession.populate('playlistId', 'title sourceType availableVideos manualTotalVideos');

    res.json({
      success: true,
      data: updatedSession,
      message: 'Day marked as completed successfully'
    });
  } catch (error) {
    console.error('Error completing day:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark day as missed
// @route   POST /api/scheduler/session/:id/miss-day
// @access  Private
const missDay = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { date, reason } = req.body;

    // Find session and ensure it belongs to user
    const session = await StudySession.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    // Check if day is already marked as missed
    const existingDay = session.missedDays.find(day => 
      day.date.toDateString() === new Date(date).toDateString()
    );

    if (existingDay) {
      return res.status(400).json({ message: 'Day already marked as missed' });
    }

    // Add missed day
    session.missedDays.push({
      date: new Date(date),
      reason: reason || 'No reason provided'
    });

    // Recalculate allocation
    await session.recalculateAllocation();

    const updatedSession = await session.save();

    // Populate playlist details
    await updatedSession.populate('playlistId', 'title sourceType availableVideos manualTotalVideos');

    res.json({
      success: true,
      data: updatedSession,
      message: 'Day marked as missed successfully'
    });
  } catch (error) {
    console.error('Error marking day as missed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createStudySession,
  getUserStudySessions,
  updateStudySession,
  deleteStudySession,
  completeDay,
  missDay
};
