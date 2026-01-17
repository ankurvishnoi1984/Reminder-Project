const express = require('express');
const router = express.Router();
const { getReports, exportReports } = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), getReports);
router.get('/export', authenticate, authorize('admin'), exportReports);

module.exports = router;
