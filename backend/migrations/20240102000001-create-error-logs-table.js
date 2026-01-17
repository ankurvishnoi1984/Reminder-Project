'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ErrorLogs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      level: {
        type: Sequelize.ENUM('error', 'warning', 'info', 'debug'),
        allowNull: false,
        defaultValue: 'error'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      stack: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      errorType: {
        type: Sequelize.STRING,
        allowNull: true
      },
      errorCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      path: {
        type: Sequelize.STRING,
        allowNull: true
      },
      method: {
        type: Sequelize.ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'),
        allowNull: true
      },
      statusCode: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      requestBody: {
        type: Sequelize.JSON,
        allowNull: true
      },
      requestQuery: {
        type: Sequelize.JSON,
        allowNull: true
      },
      requestParams: {
        type: Sequelize.JSON,
        allowNull: true
      },
      environment: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'development'
      },
      resolved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      resolvedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resolvedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      resolutionNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('ErrorLogs', ['level'], { name: 'idx_errorLogs_level' });
    await queryInterface.addIndex('ErrorLogs', ['resolved'], { name: 'idx_errorLogs_resolved' });
    await queryInterface.addIndex('ErrorLogs', ['createdAt'], { name: 'idx_errorLogs_createdAt' });
    await queryInterface.addIndex('ErrorLogs', ['path'], { name: 'idx_errorLogs_path' });
    await queryInterface.addIndex('ErrorLogs', ['method'], { name: 'idx_errorLogs_method' });
    await queryInterface.addIndex('ErrorLogs', ['errorType'], { name: 'idx_errorLogs_errorType' });
    await queryInterface.addIndex('ErrorLogs', ['userId'], { name: 'idx_errorLogs_userId' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ErrorLogs');
  }
};
