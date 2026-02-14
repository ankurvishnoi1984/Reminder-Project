const { Employee, Template, Notification, Event, FestivalMaster } = require('../models');
const { sendEmail } = require('./emailService');
const { sendSMS } = require('./smsService');
const { sendWhatsApp } = require('./whatsappService');
const moment = require('moment');

// Cache for templates to reduce database queries
const templateCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const replacePlaceholders = (template, employee, eventData = {}) => {
  let message = template.body;
  let subject = template.subject || '';

  // Common replacements
  subject = subject.replace(/{EmployeeName}/g, employee.fullName);
  message = message.replace(/{EmployeeName}/g, employee.fullName);

  if (eventData.yearsCompleted !== undefined) {
    subject = subject.replace(/{YearsCompleted}/g, eventData.yearsCompleted);
    message = message.replace(/{YearsCompleted}/g, eventData.yearsCompleted);
  }

  if (eventData.festivalName) {
    message = message.replace(/{FestivalName}/g, eventData.festivalName);
  }

  return { subject, body: message };
};


// Get template with caching
const getTemplate = async (eventType, channel) => {
  const cacheKey = `${eventType}_${channel}`;
  const cached = templateCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.template;
  }

  const template = await Template.findOne({
    where: {
      eventType: eventType,
      channel: channel,
      isActive: true
    }
  });

  if (template) {
    templateCache.set(cacheKey, { template, timestamp: Date.now() });
  }

  return template;
};

// Clear template cache
const clearTemplateCache = () => {
  templateCache.clear();
};

const sendNotification = async (employee, eventType, channel, template, eventData = {}) => {
  try {
    const { subject, body } = replacePlaceholders(template, employee, eventData);
    
    let result;
    const startTime = Date.now();
    
    switch (channel) {
      case 'Email':
        result = await sendEmail(employee.email, subject, body);
        break;
      case 'SMS':
        result = await sendSMS(employee.mobileNumber, body);
        break;
      case 'WhatsApp':
        result = await sendWhatsApp(employee.whatsappNumber || employee.mobileNumber, body);
        break;
      default:
        result = { success: false, error: 'Invalid channel' };
    }
    
    const duration = Date.now() - startTime;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${channel}] Sent to ${employee.fullName} (${employee.employeeId}): ${result.success ? 'SUCCESS' : 'FAILED'} (${duration}ms)`);
    }

    await Notification.create({
      employeeId: employee.id,
      eventType: eventType,
      channel: channel,
      status: result.success ? 'Success' : 'Failed',
      responseMessage: result.success ? result.messageId : result.error,
      sentAt: result.success ? new Date() : null,
      metadata: { subject, templateId: template.id }
    });

    return result;
  } catch (error) {
    await Notification.create({
      employeeId: employee.id,
      eventType: eventType,
      channel: channel,
      status: 'Failed',
      responseMessage: error.message,
      metadata: { templateId: template.id }
    });
    return { success: false, error: error.message };
  }
};

const processReminders = async () => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const events = await Event.findAll({ where: { isEnabled: true } });
    
    for (const event of events) {
      if (event.eventType === 'Birthday') {
        await processBirthdayReminders(event, today);
      } else if (event.eventType === 'JobAnniversary') {
        await processAnniversaryReminders(event, today);
      } else if (event.eventType === 'Festival') {
        await processFestivalReminders(event, today);
      }
    }
  } catch (error) {
    console.error('Error processing reminders:', error);
  }
};

const processBirthdayReminders = async (event, today) => {
  const reminderDates = event.reminderDays || [0];
  
  // Fetch active employees once
  const activeEmployees = await Employee.findAll({ 
    where: { status: 'Active' },
    attributes: ['id', 'fullName', 'email', 'mobileNumber', 'whatsappNumber', 'dateOfBirth']
  });

  // Pre-load templates for all channels
  const templates = {};
  const channelsToProcess = [];
  
  for (const channel of event.channels || []) {
    templates[channel] = await getTemplate('Birthday', channel);
    if (templates[channel]) {
      channelsToProcess.push(channel);
    }
  }

  if (channelsToProcess.length === 0) {
    console.log('[Birthday] No active templates found for configured channels');
    return;
  }

  console.log(`[Birthday] Processing ${channelsToProcess.join(', ')} reminders for ${activeEmployees.length} employees`);

  const notificationPromises = [];

  for (const employee of activeEmployees) {
    const dob = moment(employee.dateOfBirth);
    const currentYear = moment().year();
    const thisYearBirthday = dob.year(currentYear).format('YYYY-MM-DD');
    const nextYearBirthday = dob.year(currentYear + 1).format('YYYY-MM-DD');

    for (const daysBefore of reminderDates) {
      const reminderDate = moment(thisYearBirthday).subtract(daysBefore, 'days').format('YYYY-MM-DD');
      const nextReminderDate = moment(nextYearBirthday).subtract(daysBefore, 'days').format('YYYY-MM-DD');

      if (reminderDate === today || nextReminderDate === today) {
        for (const channel of channelsToProcess) {
          const template = templates[channel];
          if (template) {
            notificationPromises.push(
              sendNotification(employee, 'Birthday', channel, template)
            );
          }
        }
      }
    }
  }

  // Process notifications in batches to avoid overwhelming the system
  const BATCH_SIZE = 10;
  for (let i = 0; i < notificationPromises.length; i += BATCH_SIZE) {
    const batch = notificationPromises.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(batch);
  }
};

const processAnniversaryReminders = async (event, today) => {
  const reminderDates = event.reminderDays || [0];
  
  // Fetch active employees once
  const activeEmployees = await Employee.findAll({ 
    where: { status: 'Active' },
    attributes: ['id', 'fullName', 'email', 'mobileNumber', 'whatsappNumber', 'dateOfJoining']
  });

  // Pre-load templates for all channels
  const templates = {};
  const channelsToProcess = [];
  
  for (const channel of event.channels || []) {
    templates[channel] = await getTemplate('JobAnniversary', channel);
    if (templates[channel]) {
      channelsToProcess.push(channel);
    }
  }

  if (channelsToProcess.length === 0) {
    console.log('[Anniversary] No active templates found for configured channels');
    return;
  }

  console.log(`[Anniversary] Processing ${channelsToProcess.join(', ')} reminders for ${activeEmployees.length} employees`);

  const notificationPromises = [];

  for (const employee of activeEmployees) {
    const doj = moment(employee.dateOfJoining);
    const yearsCompleted = moment().diff(doj, 'years');
    const anniversaryDate = doj.add(yearsCompleted, 'years').format('YYYY-MM-DD');

    for (const daysBefore of reminderDates) {
      const reminderDate = moment(anniversaryDate).subtract(daysBefore, 'days').format('YYYY-MM-DD');

      console.log("REMINDER DATE, TODAY",reminderDate,today)

      if (reminderDate === today) {
        console.log("REMINDER DATE'S TODAY")
        for (const channel of channelsToProcess) {
          const template = templates[channel];
          if (template) {
            console.log("FOUND TEMPLATE")
            const eventData = { yearsCompleted };
            notificationPromises.push(
              sendNotification(employee, 'JobAnniversary', channel, template, eventData)
            );
          }else{
            console.log("TEMPLATE NOT FOUND")
          }
        }
      }else{
        console.log("NOW JOB ANNIVERSARY TODAY")
      }
    }
  }

  // Process notifications in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < notificationPromises.length; i += BATCH_SIZE) {
    const batch = notificationPromises.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(batch);
  }
};

const processFestivalReminders = async (event, today) => {
  const reminderDates = event.reminderDays || [0];
  
  // Fetch festivals once
  const festivals = await FestivalMaster.findAll({ 
    where: { isActive: true },
    attributes: ['id', 'festivalName', 'festivalDate']
  });

  // Fetch active employees once
  const activeEmployees = await Employee.findAll({ 
    where: { status: 'Active' },
    attributes: ['id', 'fullName', 'email', 'mobileNumber', 'whatsappNumber']
  });

  // Pre-load templates for all channels
  const templates = {};
  const channelsToProcess = [];
  
  for (const channel of event.channels || []) {
    templates[channel] = await getTemplate('Festival', channel);
    if (templates[channel]) {
      channelsToProcess.push(channel);
    }
  }

  if (channelsToProcess.length === 0) {
    console.log('[Festival] No active templates found for configured channels');
    return;
  }

  console.log(`[Festival] Processing ${channelsToProcess.join(', ')} reminders for ${festivals.length} festival(s) and ${activeEmployees.length} employees`);

  const notificationPromises = [];

  for (const festival of festivals) {
    const festivalDate = moment(festival.festivalDate);
    const currentYear = moment().year();
    const thisYearFestival = festivalDate.year(currentYear).format('YYYY-MM-DD');

    for (const daysBefore of reminderDates) {
      const reminderDate = moment(thisYearFestival).subtract(daysBefore, 'days').format('YYYY-MM-DD');

      if (reminderDate === today) {
        for (const employee of activeEmployees) {
          for (const channel of channelsToProcess) {
            const template = templates[channel];
            if (template) {
              const eventData = { festivalName: festival.festivalName };
              notificationPromises.push(
                sendNotification(employee, 'Festival', channel, template, eventData)
              );
            }
          }
        }
      }
    }
  }

  // Process notifications in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < notificationPromises.length; i += BATCH_SIZE) {
    const batch = notificationPromises.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(batch);
  }
};

// Separate processing functions for cron jobs
const processBirthdayRemindersOnly = async () => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const event = await Event.findOne({ where: { eventType: 'Birthday', isEnabled: true } });
    if (event) {
      await processBirthdayReminders(event, today);
    }
  } catch (error) {
    console.error('Error processing birthday reminders:', error);
  }
};

const processAnniversaryRemindersOnly = async () => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const event = await Event.findOne({ where: { eventType: 'JobAnniversary', isEnabled: true } });
    if (event) {
      await processAnniversaryReminders(event, today);
    }
  } catch (error) {
    console.error('Error processing anniversary reminders:', error);
  }
};

const processFestivalRemindersOnly = async () => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const event = await Event.findOne({ where: { eventType: 'Festival', isEnabled: true } });
    if (event) {
      await processFestivalReminders(event, today);
    }
  } catch (error) {
    console.error('Error processing festival reminders:', error);
  }
};

module.exports = {
  sendNotification,
  processReminders,
  processBirthdayRemindersOnly,
  processAnniversaryRemindersOnly,
  processFestivalRemindersOnly,
  replacePlaceholders,
  clearTemplateCache
};
