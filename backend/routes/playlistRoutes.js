const express = require('express');
const { body } = require('express-validator');
const {
  createPlaylist,
  getUserPlaylists,
  updateVideoProgress,
  updateManualPlaylistTotal,
  deletePlaylist,
} = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation middleware
const createPlaylistValidation = [
  body('sourceType').isIn(['youtube', 'manual']).withMessage('Source type must be either youtube or manual'),
  body('playlistUrl').if(body('sourceType').equals('youtube')).notEmpty().withMessage('Playlist URL is required for YouTube sources'),
  body('title').if(body('sourceType').equals('manual')).notEmpty().withMessage('Title is required for manual sources'),
  body('totalVideos').if(body('sourceType').equals('manual')).isInt({ min: 1, max: 1000 }).withMessage('Total videos must be between 1 and 1000 for manual sources'),
  body('videosPerDay').optional().isInt({ min: 1, max: 20 }).withMessage('Videos per day must be between 1 and 20'),
  body('trackerTitle').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Tracker title must be between 1 and 100 characters'),
];

const updateProgressValidation = [
  body('completed').isBoolean().withMessage('Completed status must be a boolean'),
  body('videoId').optional().notEmpty().withMessage('Video ID is required for YouTube playlists'),
  body('videoIndex').optional().isInt({ min: 0 }).withMessage('Video index must be a non-negative integer for manual playlists'),
];

const updateTotalValidation = [
  body('totalVideos').isInt({ min: 1, max: 1000 }).withMessage('Total videos must be between 1 and 1000'),
];

// Routes
router.post('/', createPlaylistValidation, createPlaylist);
router.get('/', getUserPlaylists);
router.patch('/:playlistId', updateProgressValidation, updateVideoProgress);
router.patch('/:playlistId/total', updateTotalValidation, updateManualPlaylistTotal);
router.delete('/:playlistId', deletePlaylist);

module.exports = router;
