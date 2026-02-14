const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ErrorLog = sequelize.define('ErrorLogs', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  level: {
    type: DataTypes.ENUM('error', 'warning', 'info', 'debug'),
    allowNull: false,
    defaultValue: 'error'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  stack: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  errorType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  errorCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  method: {
    type: DataTypes.ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'),
    allowNull: true
  },
  statusCode: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  requestBody: {
    type: DataTypes.JSON,
    allowNull: true
  },
  requestQuery: {
    type: DataTypes.JSON,
    allowNull: true
  },
  requestParams: {
    type: DataTypes.JSON,
    allowNull: true
  },
  environment: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'development'
  },
  resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

module.exports = ErrorLog;
