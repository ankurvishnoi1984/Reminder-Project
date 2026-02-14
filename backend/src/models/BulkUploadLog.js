const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BulkUploadLog = sequelize.define('BulkUploadLogs', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalRecords: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  successCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  failureCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  errorReport: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('Processing', 'Completed', 'Failed'),
    defaultValue: 'Processing'
  }
});

module.exports = BulkUploadLog;
