const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Employees',
      key: 'id'
    }
  },
  eventType: {
    type: DataTypes.ENUM('Birthday', 'JobAnniversary', 'Festival'),
    allowNull: false
  },
  channel: {
    type: DataTypes.ENUM('Email', 'WhatsApp', 'SMS'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Success', 'Failed', 'Pending'),
    defaultValue: 'Pending'
  },
  responseMessage: {
    type: DataTypes.TEXT
  },
  sentAt: {
    type: DataTypes.DATE
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

module.exports = Notification;
