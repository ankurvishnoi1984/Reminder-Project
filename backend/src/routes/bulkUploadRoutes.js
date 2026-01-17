const express = require('express');
const router = express.Router();
const { uploadEmployees, getUploadLogs } = require('../controllers/bulkUploadController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', authenticate, authorize('admin'), upload.single('file'), uploadEmployees);
router.get('/logs', authenticate, authorize('admin'), getUploadLogs);

module.exports = router;
