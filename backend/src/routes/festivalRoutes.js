const express = require('express');
const router = express.Router();
const {
  getAllFestivals,
  createFestival,
  updateFestival,
  deleteFestival
} = require('../controllers/festivalController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), getAllFestivals);
router.post('/', authenticate, authorize('admin'), createFestival);
router.put('/:id', authenticate, authorize('admin'), updateFestival);
router.delete('/:id', authenticate, authorize('admin'), deleteFestival);

module.exports = router;
