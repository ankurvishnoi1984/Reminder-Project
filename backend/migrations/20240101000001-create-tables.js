'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Users table
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'system'),
        defaultValue: 'admin'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // Employees table
    await queryInterface.createTable('Employees', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      employeeId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mobileNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      whatsappNumber: {
        type: Sequelize.STRING
      },
      dateOfBirth: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      dateOfJoining: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      department: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive'),
        defaultValue: 'Active'
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

    // Events table
    await queryInterface.createTable('Events', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      eventType: {
        type: Sequelize.ENUM('Birthday', 'JobAnniversary', 'Festival'),
        allowNull: false
      },
      isEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      reminderDays: {
        type: Sequelize.JSON,
        defaultValue: [0]
      },
      channels: {
        type: Sequelize.JSON,
        defaultValue: ['Email']
      },
      deliveryTime: {
        type: Sequelize.TIME,
        defaultValue: '09:00:00'
      },
      config: {
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

    // Templates table
    await queryInterface.createTable('Templates', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      eventType: {
        type: Sequelize.ENUM('Birthday', 'JobAnniversary', 'Festival'),
        allowNull: false
      },
      channel: {
        type: Sequelize.ENUM('Email', 'WhatsApp', 'SMS'),
        allowNull: false
      },
      subject: {
        type: Sequelize.STRING
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // FestivalMaster table
    await queryInterface.createTable('FestivalMasters', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      festivalName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      festivalDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      isRecurring: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // Notifications table
    await queryInterface.createTable('Notifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Employees',
          key: 'id'
        }
      },
      eventType: {
        type: Sequelize.ENUM('Birthday', 'JobAnniversary', 'Festival'),
        allowNull: false
      },
      channel: {
        type: Sequelize.ENUM('Email', 'WhatsApp', 'SMS'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Success', 'Failed', 'Pending'),
        defaultValue: 'Pending'
      },
      responseMessage: {
        type: Sequelize.TEXT
      },
      sentAt: {
        type: Sequelize.DATE
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

    // BulkUploadLogs table
    await queryInterface.createTable('BulkUploadLogs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fileName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      totalRecords: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      successCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      failureCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      errorReport: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      uploadedBy: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('Processing', 'Completed', 'Failed'),
        defaultValue: 'Processing'
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('BulkUploadLogs');
    await queryInterface.dropTable('Notifications');
    await queryInterface.dropTable('FestivalMasters');
    await queryInterface.dropTable('Templates');
    await queryInterface.dropTable('Events');
    await queryInterface.dropTable('Employees');
    await queryInterface.dropTable('Users');
  }
};
