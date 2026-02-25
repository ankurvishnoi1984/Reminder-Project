const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TemplateAttachment = sequelize.define('TemplateAttachments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  templateId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileType: {
    type: DataTypes.ENUM('pdf', 'image'),
  },
  mimeType: {
    type: DataTypes.STRING
  },
  fileSize: {
    type: DataTypes.INTEGER
  },
  isInline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// TemplateAttachment.belongsTo(require('./Template'), {
//   foreignKey: 'templateId'
// });

module.exports = TemplateAttachment;