const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const { sequelize } = require('./models');
const routes = require('./routes');
const { 
  processReminders,
  processBirthdayRemindersOnly,
  processAnniversaryRemindersOnly,
  processFestivalRemindersOnly
} = require('./services/notificationService');
const { initializeEmailService } = require('./services/emailService');
const { initializeSMSService } = require('./services/smsService');
const { initializeWhatsAppService } = require('./services/whatsappService');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize services
initializeEmailService();
initializeSMSService();
initializeWhatsAppService();

// Validate cron job setup after initialization
if (process.env.VALIDATE_CRON_ON_START === 'true') {
  setTimeout(async () => {
    try {
      const { validateCronJobs } = require('./utils/cronValidator');
      await validateCronJobs();
    } catch (error) {
      console.error('Cron validation error:', error);
    }
  }, 2000); // Wait 2 seconds for services to initialize
}

// Helper function to get cron time from delivery time (HH:mm format)
const getCronTime = (deliveryTime) => {
  // Default to 8 AM if not provided
  if (!deliveryTime) {
    return '0 8 * * *';
  }
  
  // Parse HH:mm format
  const [hours, minutes] = deliveryTime.split(':').map(Number);
  return `${minutes || 0} ${hours || 8} * * *`;
};

// Separate cron jobs for different event types
// This allows different delivery times for different event types

// Birthday reminders cron job
// Processes Email, SMS, and WhatsApp based on event configuration
const birthdayCronJob = cron.schedule('*/15 * * * *', async () => {
  // Check every 15 minutes if there are birthdays to process
  // The actual processing checks if today matches the reminder date
  console.log('[Cron Birthday] Checking birthday reminders (Email, SMS, WhatsApp)...');
  try {
    await processBirthdayRemindersOnly();
    console.log('[Cron Birthday] Birthday reminder check completed');
  } catch (error) {
    console.error('[Cron Birthday] Error in birthday reminder job:', error);
  }
}, {
  scheduled: true,
  timezone: process.env.TZ || "America/New_York"
});

if (process.env.NODE_ENV === 'development') {
  console.log('✓ Birthday cron job scheduled: Every 15 minutes (*/15 * * * *)');
}

// Work Anniversary reminders cron job
// Processes Email, SMS, and WhatsApp based on event configuration
const anniversaryCronJob = cron.schedule('*/15 * * * *', async () => {
  // Check every 15 minutes for work anniversaries
  console.log('[Cron Anniversary] Checking work anniversary reminders (Email, SMS, WhatsApp)...');
  try {
    await processAnniversaryRemindersOnly();
    console.log('[Cron Anniversary] Anniversary reminder check completed');
  } catch (error) {
    console.error('[Cron Anniversary] Error in anniversary reminder job:', error);
  }
}, {
  scheduled: true,
  timezone: process.env.TZ || "America/New_York"
});

if (process.env.NODE_ENV === 'development') {
  console.log('✓ Anniversary cron job scheduled: Every 15 minutes (*/15 * * * *)');
}

// Festival reminders cron job
// Processes Email, SMS, and WhatsApp based on event configuration
const festivalCronJob = cron.schedule('*/15 * * * *', async () => {
  // Check every 15 minutes for festival reminders
  console.log('[Cron Festival] Checking festival reminders (Email, SMS, WhatsApp)...');
  try {
    await processFestivalRemindersOnly();
    console.log('[Cron Festival] Festival reminder check completed');
  } catch (error) {
    console.error('[Cron Festival] Error in festival reminder job:', error);
  }
}, {
  scheduled: true,
  timezone: process.env.TZ || "America/New_York"
});

if (process.env.NODE_ENV === 'development') {
  console.log('✓ Festival cron job scheduled: Every 15 minutes (*/15 * * * *)');
  console.log('✓ All cron jobs configured for Email, SMS, and WhatsApp channels');
}

// Legacy cron job (kept for backward compatibility)
// This runs all reminders at 8 AM as before
cron.schedule('0 8 * * *', async () => {
  console.log('[Cron] Running legacy daily reminder job at 8 AM...');
  try {
    await processReminders();
    console.log('[Cron] Legacy reminder job completed successfully');
  } catch (error) {
    console.error('Error in legacy reminder job:', error);
  }
}, {
  scheduled: process.env.ENABLE_LEGACY_CRON === 'true', // Disabled by default
  timezone: process.env.TZ || "America/New_York"
});

// Database connection and server start
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully');
    
    // Sync models (use force: false in production)
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  });
