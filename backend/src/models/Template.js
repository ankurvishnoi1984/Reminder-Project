const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Template = sequelize.define('Template', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventType: {
    type: DataTypes.ENUM('Birthday', 'JobAnniversary', 'Festival'),
    allowNull: false
  },
  channel: {
    type: DataTypes.ENUM('Email', 'WhatsApp', 'SMS'),
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Template;
