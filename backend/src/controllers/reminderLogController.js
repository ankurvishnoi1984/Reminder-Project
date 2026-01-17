const { Notification, Employee } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Get reminder logs with filtering and pagination
 * Supports filtering by: eventType, channel, status, date range, employeeId
 */
const getReminderLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      eventType, 
      channel, 
      status, 
      startDate, 
      endDate,
      employeeId,
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    // Filter by event type
    if (eventType) {
      where.eventType = eventType;
    }

    // Filter by channel
    if (channel) {
      where.channel = channel;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.sentAt = {};
      if (startDate) {
        where.sentAt[Op.gte] = moment(startDate).startOf('day').toDate();
      }
      if (endDate) {
        where.sentAt[Op.lte] = moment(endDate).endOf('day').toDate();
      }
    } else if (!startDate && !endDate) {
      // Default: last 30 days if no date range specified
      where.sentAt = {
        [Op.gte]: moment().subtract(30, 'days').startOf('day').toDate()
      };
    }

    // Filter by employee ID
    if (employeeId) {
      where.employeeId = employeeId;
    }

    // Include employee details for search
    const includeOptions = [
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'employeeId', 'fullName', 'email', 'department'],
        required: false
      }
    ];

    // Search functionality - search in employee name, email, or employeeId
    if (search) {
      includeOptions[0].where = {
        [Op.or]: [
          { fullName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { employeeId: { [Op.like]: `%${search}%` } }
        ]
      };
      includeOptions[0].required = true;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      include: includeOptions,
      order: [['sentAt', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      logs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reminder logs:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get reminder log statistics
 * Returns counts by eventType, channel, status, etc.
 */
const getReminderLogStats = async (req, res) => {
  try {
    const { startDate, endDate, eventType, channel } = req.query;

    const where = {};

    // Date range filter
    if (startDate || endDate) {
      where.sentAt = {};
      if (startDate) {
        where.sentAt[Op.gte] = moment(startDate).startOf('day').toDate();
      }
      if (endDate) {
        where.sentAt[Op.lte] = moment(endDate).endOf('day').toDate();
      }
    } else {
      // Default: last 30 days
      where.sentAt = {
        [Op.gte]: moment().subtract(30, 'days').startOf('day').toDate()
      };
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (channel) {
      where.channel = channel;
    }

    // Get total count
    const total = await Notification.count({ where });

    // Get count by status
    const successCount = await Notification.count({
      where: { ...where, status: 'Success' }
    });

    const failedCount = await Notification.count({
      where: { ...where, status: 'Failed' }
    });

    const pendingCount = await Notification.count({
      where: { ...where, status: 'Pending' }
    });

    // Get count by event type
    const birthdayCount = await Notification.count({
      where: { ...where, eventType: 'Birthday' }
    });

    const anniversaryCount = await Notification.count({
      where: { ...where, eventType: 'JobAnniversary' }
    });

    const festivalCount = await Notification.count({
      where: { ...where, eventType: 'Festival' }
    });

    // Get count by channel
    const emailCount = await Notification.count({
      where: { ...where, channel: 'Email' }
    });

    const smsCount = await Notification.count({
      where: { ...where, channel: 'SMS' }
    });

    const whatsappCount = await Notification.count({
      where: { ...where, channel: 'WhatsApp' }
    });

    // Get daily counts for the last 7 days
    const dailyCounts = [];
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      const count = await Notification.count({
        where: {
          ...where,
          sentAt: {
            [Op.gte]: moment(date).startOf('day').toDate(),
            [Op.lte]: moment(date).endOf('day').toDate()
          }
        }
      });
      dailyCounts.push({ date, count });
    }

    res.json({
      total,
      byStatus: {
        success: successCount,
        failed: failedCount,
        pending: pendingCount
      },
      byEventType: {
        birthday: birthdayCount,
        anniversary: anniversaryCount,
        festival: festivalCount
      },
      byChannel: {
        email: emailCount,
        sms: smsCount,
        whatsapp: whatsappCount
      },
      dailyCounts
    });
  } catch (error) {
    console.error('Error fetching reminder log stats:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get reminder log by ID
 */
const getReminderLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await Notification.findOne({
      where: { id },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'employeeId', 'fullName', 'email', 'mobileNumber', 'department']
        }
      ]
    });

    if (!log) {
      return res.status(404).json({ message: 'Reminder log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Error fetching reminder log:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Export reminder logs as CSV
 */
const exportReminderLogs = async (req, res) => {
  try {
    const { 
      eventType, 
      channel, 
      status, 
      startDate, 
      endDate,
      employeeId
    } = req.query;

    const where = {};

    if (eventType) where.eventType = eventType;
    if (channel) where.channel = channel;
    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;

    if (startDate || endDate) {
      where.sentAt = {};
      if (startDate) {
        where.sentAt[Op.gte] = moment(startDate).startOf('day').toDate();
      }
      if (endDate) {
        where.sentAt[Op.lte] = moment(endDate).endOf('day').toDate();
      }
    }

    const logs = await Notification.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employeeId', 'fullName', 'email', 'department'],
          required: false
        }
      ],
      order: [['sentAt', 'DESC']],
      limit: 10000 // Limit export to 10k records
    });

    // Convert to CSV format
    const csvData = logs.map(log => ({
      'ID': log.id,
      'Employee ID': log.employee?.employeeId || '',
      'Employee Name': log.employee?.fullName || '',
      'Email': log.employee?.email || '',
      'Department': log.employee?.department || '',
      'Event Type': log.eventType,
      'Channel': log.channel,
      'Status': log.status,
      'Sent At': log.sentAt ? moment(log.sentAt).format('YYYY-MM-DD HH:mm:ss') : '',
      'Response Message': log.responseMessage || '',
      'Created At': moment(log.createdAt).format('YYYY-MM-DD HH:mm:ss')
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=reminder-logs-${moment().format('YYYY-MM-DD')}.csv`);
    
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
    console.error('Error exporting reminder logs:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReminderLogs,
  getReminderLogStats,
  getReminderLogById,
  exportReminderLogs
};
