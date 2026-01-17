'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create default admin user
    await queryInterface.bulkInsert('Users', [{
      email: 'admin@company.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Create default events
    await queryInterface.bulkInsert('Events', [
      {
        eventType: 'Birthday',
        isEnabled: true,
        reminderDays: JSON.stringify([0]),
        channels: JSON.stringify(['Email']),
        deliveryTime: '09:00:00',
        config: JSON.stringify({}),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventType: 'JobAnniversary',
        isEnabled: true,
        reminderDays: JSON.stringify([0]),
        channels: JSON.stringify(['Email']),
        deliveryTime: '09:00:00',
        config: JSON.stringify({}),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventType: 'Festival',
        isEnabled: true,
        reminderDays: JSON.stringify([0]),
        channels: JSON.stringify(['Email']),
        deliveryTime: '09:00:00',
        config: JSON.stringify({}),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Create default templates
    await queryInterface.bulkInsert('Templates', [
      {
        eventType: 'Birthday',
        channel: 'Email',
        subject: 'Happy Birthday {EmployeeName}!',
        body: 'Dear {EmployeeName},\n\nWishing you a very Happy Birthday! May your special day be filled with joy and happiness.\n\nBest regards,\nHR Team',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventType: 'JobAnniversary',
        channel: 'Email',
        subject: 'Congratulations on {YearsCompleted} Years!',
        body: 'Dear {EmployeeName},\n\nCongratulations on completing {YearsCompleted} years with us! Thank you for your dedication and contribution.\n\nBest regards,\nHR Team',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventType: 'Festival',
        channel: 'Email',
        subject: 'Happy {FestivalName}!',
        body: 'Dear {EmployeeName},\n\nWishing you and your family a very Happy {FestivalName}! May this festival bring joy and prosperity.\n\nBest regards,\nHR Team',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Templates', null, {});
    await queryInterface.bulkDelete('Events', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
