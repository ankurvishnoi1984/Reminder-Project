const { Notification, Employee } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

const getReports = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      eventType, 
      channel, 
      status,
      page = 1,
      limit = 50
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (startDate && endDate) {
      where.sentAt = {
        [Op.between]: [moment(startDate).toDate(), moment(endDate).toDate()]
      };
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (channel) {
      where.channel = channel;
    }

    if (status) {
      where.status = status;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employeeId', 'fullName', 'email', 'department']
        }
      ],
      order: [['sentAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      reports: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportReports = async (req, res) => {
  try {
    const { startDate, endDate, eventType, channel, status } = req.query;

    const where = {};

    if (startDate && endDate) {
      where.sentAt = {
        [Op.between]: [moment(startDate).toDate(), moment(endDate).toDate()]
      };
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (channel) {
      where.channel = channel;
    }

    if (status) {
      where.status = status;
    }

    const notifications = await Notification.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employeeId', 'fullName', 'email', 'department']
        }
      ],
      order: [['sentAt', 'DESC']]
    });

    // Convert to CSV format
    const csvData = notifications.map(notif => ({
      'Employee ID': notif.employee?.employeeId || '',
      'Employee Name': notif.employee?.fullName || '',
      'Email': notif.employee?.email || '',
      'Department': notif.employee?.department || '',
      'Event Type': notif.eventType,
      'Channel': notif.channel,
      'Status': notif.status,
      'Sent At': notif.sentAt ? moment(notif.sentAt).format('YYYY-MM-DD HH:mm:ss') : '',
      'Response': notif.responseMessage || ''
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=reports.csv');
    
    // Simple CSV generation
    if (csvData.length > 0) {
      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','));
      res.send([headers, ...rows].join('\n'));
    } else {
      res.send('No data available');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReports, exportReports };
