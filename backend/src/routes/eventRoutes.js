const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  updateEvent
} = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), getAllEvents);
router.get('/:id', authenticate, authorize('admin'), getEventById);
router.put('/:id', authenticate, authorize('admin'), updateEvent);

module.exports = router;
