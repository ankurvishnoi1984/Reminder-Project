const express = require('express');
const router = express.Router();
const {
  getErrorLogs,
  getErrorLogById,
  getErrorStats,
  resolveError,
  deleteErrorLog,
  exportErrorLogs
} = require('../controllers/errorLogController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication and admin authorization
router.get('/', authenticate, authorize('admin'), getErrorLogs);
router.get('/stats', authenticate, authorize('admin'), getErrorStats);
router.get('/:id', authenticate, authorize('admin'), getErrorLogById);
router.patch('/:id/resolve', authenticate, authorize('admin'), resolveError);
router.delete('/:id', authenticate, authorize('admin'), deleteErrorLog);
router.get('/export/csv', authenticate, authorize('admin'), exportErrorLogs);

module.exports = router;
