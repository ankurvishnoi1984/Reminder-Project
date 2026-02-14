const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Events', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventType: {
    type: DataTypes.ENUM('Birthday', 'JobAnniversary', 'Festival'),
    allowNull: false
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  reminderDays: {
    type: DataTypes.JSON,
    defaultValue: [0]
  },
  channels: {
    type: DataTypes.JSON,
    defaultValue: ['Email']
  },
  deliveryTime: {
    type: DataTypes.TIME,
    defaultValue: '09:00:00'
  },
  config: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

module.exports = Event;
