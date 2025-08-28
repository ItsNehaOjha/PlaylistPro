const express = require('express');
const { body } = require('express-validator');
const {
  createStudySession,
  getUserStudySessions,
  updateStudySession,
  deleteStudySession,
  completeDay,
  missDay
} = require('../controllers/schedulerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Validation middleware
const createSessionValidation = [
  body('playlistId').isMongoId().withMessage('Valid playlist ID is required'),
  body('sessionName').trim().isLength({ min: 1, max: 100 }).withMessage('Session name must be between 1 and 100 characters'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
];

const updateSessionValidation = [
  body('sessionName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Session name must be between 1 and 100 characters'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('status').optional().isIn(['active', 'completed', 'cancelled']).withMessage('Status must be active, completed, or cancelled')
];

const completeDayValidation = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('videosCompleted').optional().isInt({ min: 0 }).withMessage('Videos completed must be a non-negative integer')
];

const missDayValidation = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('reason').optional().trim().isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters')
];

// Routes
router.post('/session', createSessionValidation, createStudySession);
router.get('/sessions/:userId', getUserStudySessions);
router.put('/session/:id', updateSessionValidation, updateStudySession);
router.delete('/session/:id', deleteStudySession);
router.post('/session/:id/complete-day', completeDayValidation, completeDay);
router.post('/session/:id/miss-day', missDayValidation, missDay);

module.exports = router;
