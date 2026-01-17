const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FestivalMaster = sequelize.define('FestivalMaster', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  festivalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  festivalDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = FestivalMaster;
