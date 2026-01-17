const LoggerService = require('../services/loggerService');

/**
 * Get error logs with filtering and pagination
 */
const getErrorLogs = async (req, res) => {
  try {
    const {
      level,
      resolved,
      startDate,
      endDate,
      path,
      method,
      errorType,
      userId,
      page = 1,
      limit = 50
    } = req.query;

    const filters = {
      level,
      resolved: resolved === 'true' ? true : resolved === 'false' ? false : undefined,
      startDate,
      endDate,
      path,
      method,
      errorType,
      userId,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await LoggerService.getLogs(filters);

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * Get error log by ID
 */
const getErrorLogById = async (req, res) => {
  try {
    const { ErrorLog, User } = require('../models');
    const { id } = req.params;

    const log = await ErrorLog.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email'],
          required: false
        },
        {
          model: User,
          as: 'resolver',
          attributes: ['id', 'email'],
          required: false
        }
      ]
    });

    if (!log) {
      return res.status(404).json({ 
        success: false, 
        message: 'Error log not found' 
      });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * Get error statistics
 */
const getErrorStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filters = { startDate, endDate };
    const stats = await LoggerService.getStats(filters);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * Mark error as resolved
 */
const resolveError = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    const log = await LoggerService.resolveError(id, userId, resolutionNotes);

    res.json({
      success: true,
      message: 'Error marked as resolved',
      log
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * Delete error log
 */
const deleteErrorLog = async (req, res) => {
  try {
    const { ErrorLog } = require('../models');
    const { id } = req.params;

    const log = await ErrorLog.findByPk(id);

    if (!log) {
      return res.status(404).json({ 
        success: false, 
        message: 'Error log not found' 
      });
    }

    await log.destroy();

    res.json({
      success: true,
      message: 'Error log deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * Export error logs as CSV
 */
const exportErrorLogs = async (req, res) => {
  try {
    const { ErrorLog } = require('../models');
    const moment = require('moment');
    const {
      level,
      resolved,
      startDate,
      endDate,
      path,
      method,
      errorType
    } = req.query;

    const where = {};
    const { Op } = require('sequelize');

    if (level) where.level = level;
    if (resolved !== undefined) where.resolved = resolved === 'true';
    if (path) where.path = { [Op.like]: `%${path}%` };
    if (method) where.method = method;
    if (errorType) where.errorType = { [Op.like]: `%${errorType}%` };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const logs = await ErrorLog.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 10000
    });

    const csvData = logs.map(log => ({
      'ID': log.id,
      'Level': log.level,
      'Message': log.message?.substring(0, 200) || '',
      'Error Type': log.errorType || '',
      'Error Code': log.errorCode || '',
      'Path': log.path || '',
      'Method': log.method || '',
      'Status Code': log.statusCode || '',
      'Resolved': log.resolved ? 'Yes' : 'No',
      'Environment': log.environment || '',
      'IP Address': log.ipAddress || '',
      'Created At': moment(log.createdAt).format('YYYY-MM-DD HH:mm:ss')
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=error-logs-${moment().format('YYYY-MM-DD')}.csv`);

    if (csvData.length > 0) {
      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row =>
        Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
      );
      res.send([headers, ...rows].join('\n'));
    } else {
      res.send('No data available');
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  getErrorLogs,
  getErrorLogById,
  getErrorStats,
  resolveError,
  deleteErrorLog,
  exportErrorLogs
};
