/**
 * Standalone script to validate cron job configuration
 * Run with: node backend/scripts/validate-cron.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { validateCronJobs } = require('../src/utils/cronValidator');

// Initialize services first
const { initializeSMSService } = require('../src/services/smsService');
const { initializeWhatsAppService } = require('../src/services/whatsappService');
const { initializeEmailService } = require('../src/services/emailService');

async function main() {
  console.log('Initializing services...');
  
  initializeEmailService();
  initializeSMSService();
  initializeWhatsAppService();

  // Wait a bit for services to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    await validateCronJobs();
    process.exit(0);
  } catch (error) {
    console.error('Validation failed:', error);
    process.exit(1);
  }
}

main();
