const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  whatsappNumber: {
    type: DataTypes.STRING
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dateOfJoining: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active'
  }
});

module.exports = Employee;
