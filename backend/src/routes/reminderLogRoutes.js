const express = require('express');
const router = express.Router();
const {
  getReminderLogs,
  getReminderLogStats,
  getReminderLogById,
  exportReminderLogs
} = require('../controllers/reminderLogController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication and admin authorization
router.get('/', authenticate, authorize('admin'), getReminderLogs);
router.get('/stats', authenticate, authorize('admin'), getReminderLogStats);
router.get('/:id', authenticate, authorize('admin'), getReminderLogById);
router.get('/export/csv', authenticate, authorize('admin'), exportReminderLogs);

module.exports = router;
