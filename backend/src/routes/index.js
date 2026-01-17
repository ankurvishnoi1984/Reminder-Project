const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/employees', require('./employeeRoutes'));
router.use('/bulk-upload', require('./bulkUploadRoutes'));
router.use('/templates', require('./templateRoutes'));
router.use('/events', require('./eventRoutes'));
router.use('/festivals', require('./festivalRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/reports', require('./reportRoutes'));
router.use('/reminder-logs', require('./reminderLogRoutes'));
router.use('/error-logs', require('./errorLogRoutes'));

module.exports = router;
