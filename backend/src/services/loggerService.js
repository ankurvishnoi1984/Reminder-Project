const ErrorLog = require('../models/ErrorLog');
const { Op, Sequelize } = require('sequelize');

/**
 * Logger Service for capturing and storing errors/issues
 */
class LoggerService {
  /**
   * Log an error
   */
  static async logError(error, req = null, additionalData = {}) {
    try {
      const errorData = {
        level: 'error',
        message: error.message || 'Unknown error',
        stack: error.stack || null,
        errorType: error.name || 'Error',
        errorCode: error.code || null,
        environment: process.env.NODE_ENV || 'development',
        ...additionalData
      };

      // Extract request information if available
      if (req) {
        errorData.path = req.path || req.url;
        errorData.method = req.method;
        errorData.ipAddress = req.ip || req.connection?.remoteAddress || null;
        errorData.userAgent = req.get('user-agent') || null;

        // Extract request body (sanitize sensitive data)
        if (req.body) {
          errorData.requestBody = this.sanitizeSensitiveData(req.body);
        }

        // Extract query parameters
        if (req.query && Object.keys(req.query).length > 0) {
          errorData.requestQuery = req.query;
        }

        // Extract route parameters
        if (req.params && Object.keys(req.params).length > 0) {
          errorData.requestParams = req.params;
        }

        // Extract user ID if authenticated
        if (req.user && req.user.id) {
          errorData.userId = req.user.id;
        }
      }

      // Extract status code if available
      if (error.status || error.statusCode) {
        errorData.statusCode = error.status || error.statusCode;
      }

      // Store in database
      const logEntry = await ErrorLog.create(errorData);

      // Also log to console for development
      if (process.env.NODE_ENV === 'development') {
        console.error(`[ErrorLog ${logEntry.id}]`, error);
      }

      return logEntry;
    } catch (logError) {
      // Fallback to console if database logging fails
      console.error('Failed to log error to database:', logError);
      console.error('Original error:', error);
      return null;
    }
  }

  /**
   * Log a warning
   */
  static async logWarning(message, req = null, additionalData = {}) {
    try {
      const logData = {
        level: 'warning',
        message: message,
        environment: process.env.NODE_ENV || 'development',
        ...additionalData
      };

      if (req) {
        logData.path = req.path || req.url;
        logData.method = req.method;
        logData.ipAddress = req.ip || req.connection?.remoteAddress || null;
        logData.userAgent = req.get('user-agent') || null;

        if (req.user && req.user.id) {
          logData.userId = req.user.id;
        }
      }

      const logEntry = await ErrorLog.create(logData);

      if (process.env.NODE_ENV === 'development') {
        console.warn(`[WarningLog ${logEntry.id}]`, message);
      }

      return logEntry;
    } catch (error) {
      console.error('Failed to log warning:', error);
      console.warn('Original warning:', message);
      return null;
    }
  }

  /**
   * Log info message
   */
  static async logInfo(message, req = null, additionalData = {}) {
    try {
      const logData = {
        level: 'info',
        message: message,
        environment: process.env.NODE_ENV || 'development',
        ...additionalData
      };

      if (req) {
        logData.path = req.path || req.url;
        logData.method = req.method;

        if (req.user && req.user.id) {
          logData.userId = req.user.id;
        }
      }

      return await ErrorLog.create(logData);
    } catch (error) {
      console.error('Failed to log info:', error);
      return null;
    }
  }

  /**
   * Sanitize sensitive data from request body
   */
  static sanitizeSensitiveData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'apikey', 'api_key', 'authorization'];
    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    for (const key in sanitized) {
      const lowerKey = key.toLowerCase();
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeSensitiveData(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Get error logs with filtering
   */
  static async getLogs(filters = {}) {
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
    } = filters;

    const where = {};

    if (level) {
      where.level = level;
    }

    if (resolved !== undefined) {
      where.resolved = resolved;
    }

    if (path) {
      where.path = { [Op.like]: `%${path}%` };
    }

    if (method) {
      where.method = method;
    }

    if (errorType) {
      where.errorType = { [Op.like]: `%${errorType}%` };
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await ErrorLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      logs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };
  }

  /**
   * Get error statistics
   */
  static async getStats(filters = {}) {
    const { startDate, endDate } = filters;
    const where = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    } else {
      // Default: last 30 days
      where.createdAt = {
        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      };
    }

    const total = await ErrorLog.count({ where });

    const byLevel = {
      error: await ErrorLog.count({ where: { ...where, level: 'error' } }),
      warning: await ErrorLog.count({ where: { ...where, level: 'warning' } }),
      info: await ErrorLog.count({ where: { ...where, level: 'info' } }),
      debug: await ErrorLog.count({ where: { ...where, level: 'debug' } })
    };

    const resolved = await ErrorLog.count({ where: { ...where, resolved: true } });
    const unresolved = await ErrorLog.count({ where: { ...where, resolved: false } });

    // Top error types
    const topErrorTypes = await ErrorLog.findAll({
      where,
      attributes: [
        'errorType',
        [Sequelize.fn('COUNT', Sequelize.col('errorType')), 'count']
      ],
      group: ['errorType'],
      order: [[Sequelize.literal('count'), 'DESC']],
      limit: 10
    });

    // Top paths with errors
    const topPaths = await ErrorLog.findAll({
      where,
      attributes: [
        'path',
        [Sequelize.fn('COUNT', Sequelize.col('path')), 'count']
      ],
      group: ['path'],
      order: [[Sequelize.literal('count'), 'DESC']],
      limit: 10
    });

    return {
      total,
      byLevel,
      resolved,
      unresolved,
      topErrorTypes: topErrorTypes.map(item => ({
        errorType: item.errorType || 'Unknown',
        count: parseInt(item.get('count'))
      })),
      topPaths: topPaths.map(item => ({
        path: item.path || 'Unknown',
        count: parseInt(item.get('count'))
      }))
    };
  }

  /**
   * Mark error as resolved
   */
  static async resolveError(logId, userId, resolutionNotes = '') {
    const log = await ErrorLog.findByPk(logId);
    if (!log) {
      throw new Error('Error log not found');
    }

    await log.update({
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: userId,
      resolutionNotes
    });

    return log;
  }
}

module.exports = LoggerService;
