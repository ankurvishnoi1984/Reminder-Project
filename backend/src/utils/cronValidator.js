/**
 * Cron Job Validation Utility
 * Validates that cron jobs are correctly set up for Email, SMS, and WhatsApp
 */

const { Event, Template } = require('../models');
const { isSMSConfigured } = require('../services/smsService');
const { isWhatsAppConfigured } = require('../services/whatsappService');

/**
 * Validate that cron jobs can process all configured channels
 */
const validateCronJobs = async () => {
  console.log('\n=== Cron Job Validation ===\n');
  
  const results = {
    email: { configured: true, templates: 0, events: [] },
    sms: { configured: false, templates: 0, events: [] },
    whatsapp: { configured: false, templates: 0, events: [] }
  };

  // Check SMS configuration
  try {
    results.sms.configured = isSMSConfigured();
    console.log(`✓ SMS Service: ${results.sms.configured ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  } catch (error) {
    console.error(`✗ SMS Service check failed: ${error.message}`);
  }

  // Check WhatsApp configuration
  try {
    results.whatsapp.configured = isWhatsAppConfigured();
    console.log(`✓ WhatsApp Service: ${results.whatsapp.configured ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  } catch (error) {
    console.error(`✗ WhatsApp Service check failed: ${error.message}`);
  }

  // Email is always considered configured (uses SMTP)
  console.log(`✓ Email Service: CONFIGURED (SMTP)`);

  // Check events and their configured channels
  try {
    const events = await Event.findAll({ where: { isEnabled: true } });
    console.log(`\n✓ Found ${events.length} enabled event(s)\n`);

    for (const event of events) {
      const channels = event.channels || [];
      console.log(`Event: ${event.eventType}`);
      console.log(`  Channels: ${channels.join(', ')}`);
      console.log(`  Reminder Days: ${JSON.stringify(event.reminderDays || [0])}`);

      // Count templates for each channel
      for (const channel of channels) {
        const templateCount = await Template.count({
          where: {
            eventType: event.eventType,
            channel: channel,
            isActive: true
          }
        });

        if (channel === 'Email') {
          results.email.templates += templateCount;
          results.email.events.push({
            eventType: event.eventType,
            templateCount
          });
        } else if (channel === 'SMS') {
          results.sms.templates += templateCount;
          results.sms.events.push({
            eventType: event.eventType,
            templateCount
          });
        } else if (channel === 'WhatsApp') {
          results.whatsapp.templates += templateCount;
          results.whatsapp.events.push({
            eventType: event.eventType,
            templateCount
          });
        }

        console.log(`    ${channel}: ${templateCount} active template(s)`);
      }
      console.log('');
    }
  } catch (error) {
    console.error(`✗ Error checking events: ${error.message}`);
  }

  // Summary
  console.log('=== Validation Summary ===\n');
  console.log('Email:');
  console.log(`  Configured: ${results.email.configured ? '✓' : '✗'}`);
  console.log(`  Templates: ${results.email.templates}`);
  console.log(`  Events: ${results.email.events.length}`);
  
  console.log('\nSMS:');
  console.log(`  Configured: ${results.sms.configured ? '✓' : '✗'}`);
  console.log(`  Templates: ${results.sms.templates}`);
  console.log(`  Events: ${results.sms.events.length}`);
  
  console.log('\nWhatsApp:');
  console.log(`  Configured: ${results.whatsapp.configured ? '✓' : '✗'}`);
  console.log(`  Templates: ${results.whatsapp.templates}`);
  console.log(`  Events: ${results.whatsapp.events.length}`);

  // Warnings
  console.log('\n=== Warnings ===\n');
  let hasWarnings = false;

  if (!results.sms.configured && results.sms.templates > 0) {
    console.warn('⚠ WARNING: SMS templates exist but SMS service is not configured!');
    hasWarnings = true;
  }

  if (!results.whatsapp.configured && results.whatsapp.templates > 0) {
    console.warn('⚠ WARNING: WhatsApp templates exist but WhatsApp service is not configured!');
    hasWarnings = true;
  }

  if (results.email.templates === 0 && results.sms.templates === 0 && results.whatsapp.templates === 0) {
    console.warn('⚠ WARNING: No active templates found for any channel!');
    hasWarnings = true;
  }

  if (!hasWarnings) {
    console.log('✓ No warnings - all configured channels are ready!\n');
  }

  return results;
};

/**
 * Validate that a specific channel is ready for cron jobs
 */
const validateChannel = async (channel) => {
  const channelLower = channel.toLowerCase();
  
  if (channelLower === 'email') {
    return {
      configured: true,
      service: 'SMTP',
      message: 'Email service is always available via SMTP'
    };
  } else if (channelLower === 'sms') {
    const configured = isSMSConfigured();
    return {
      configured,
      service: 'Twilio SMS',
      message: configured 
        ? 'SMS service is configured and ready' 
        : 'SMS service is NOT configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER'
    };
  } else if (channelLower === 'whatsapp' || channelLower === 'whats app') {
    const configured = isWhatsAppConfigured();
    return {
      configured,
      service: 'Twilio WhatsApp',
      message: configured 
        ? 'WhatsApp service is configured and ready' 
        : 'WhatsApp service is NOT configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER'
    };
  }

  return {
    configured: false,
    service: 'Unknown',
    message: `Unknown channel: ${channel}`
  };
};

module.exports = {
  validateCronJobs,
  validateChannel
};
