const sequelize = require('../config/database');
const User = require('./User');
const Employee = require('./Employee');
const Event = require('./Event');
const Template = require('./Template');
const FestivalMaster = require('./FestivalMaster');
const Notification = require('./Notification');
const BulkUploadLog = require('./BulkUploadLog');
const ErrorLog = require('./ErrorLog');
const TemplateAttachment = require('./TemplateAttachment');

// Associations
Employee.hasMany(Notification, { foreignKey: 'employeeId', as: 'notifications' });
Notification.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

User.hasMany(BulkUploadLog, { foreignKey: 'uploadedBy', as: 'uploads' });
BulkUploadLog.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

User.hasMany(ErrorLog, { foreignKey: 'userId', as: 'errorLogs' });
ErrorLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(ErrorLog, { foreignKey: 'resolvedBy', as: 'resolvedErrorLogs' });
ErrorLog.belongsTo(User, { foreignKey: 'resolvedBy', as: 'resolver' });


Template.hasMany(TemplateAttachment, {
  foreignKey: 'templateId',
  as: 'attachments',
});

TemplateAttachment.belongsTo(Template, {
  foreignKey: 'templateId',
});

module.exports = {
  sequelize,
  User,
  Employee,
  Event,
  Template,
  TemplateAttachment,
  FestivalMaster,
  Notification,
  BulkUploadLog,
  ErrorLog
};
