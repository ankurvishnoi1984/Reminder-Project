const { Employee, Notification, Event, sequelize } = require('../models');
const { Op, Sequelize } = require('sequelize');
const moment = require('moment');

const getDashboardStats = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');

    // Total employees
    const totalEmployees = await Employee.count();

    // Today's birthdays
    const todayMonth = moment().month() + 1;
    const todayDay = moment().date();
    const todayBirthdays = await Employee.count({
      where: {
        status: 'Active',
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('MONTH', Sequelize.col('dateOfBirth')),
            todayMonth
          ),
          Sequelize.where(
            Sequelize.fn('DAY', Sequelize.col('dateOfBirth')),
            todayDay
          )
        ]
      }
    });

    // Upcoming anniversaries (next 7 days)
    const upcomingAnniversaries = await Employee.count({
      where: {
        status: 'Active',
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('MONTH', Sequelize.col('dateOfJoining')),
            todayMonth
          ),
          Sequelize.where(
            Sequelize.fn('DAY', Sequelize.col('dateOfJoining')),
            { [Op.gte]: todayDay, [Op.lte]: moment().add(7, 'days').date() }
          )
        ]
      }
    });

    // Messages sent today
    const messagesToday = await Notification.count({
      where: {
        sentAt: {
          [Op.gte]: moment().startOf('day').toDate(),
          [Op.lte]: moment().endOf('day').toDate()
        }
      }
    });

    // Messages sent this month
    const messagesThisMonth = await Notification.count({
      where: {
        sentAt: {
          [Op.gte]: moment().startOf('month').toDate(),
          [Op.lte]: moment().endOf('month').toDate()
        }
      }
    });

    // Success vs Failure
    const successCount = await Notification.count({
      where: {
        status: 'Success',
        sentAt: {
          [Op.gte]: moment().startOf('month').toDate(),
          [Op.lte]: moment().endOf('month').toDate()
        }
      }
    });

    const failureCount = await Notification.count({
      where: {
        status: 'Failed',
        sentAt: {
          [Op.gte]: moment().startOf('month').toDate(),
          [Op.lte]: moment().endOf('month').toDate()
        }
      }
    });

    res.json({
      totalEmployees,
      todayBirthdays,
      upcomingAnniversaries,
      messagesToday,
      messagesThisMonth,
      successCount,
      failureCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
