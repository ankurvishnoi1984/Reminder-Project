const twilio = require('twilio');

let twilioClient = null;
let isConfigured = false;

const initializeSMSService = () => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && phoneNumber) {
      twilioClient = twilio(accountSid, authToken);
      isConfigured = true;
      console.log('SMS service initialized successfully');
      return true;
    } else {
      console.warn('SMS service not fully configured. Missing required environment variables.');
      isConfigured = false;
      return false;
    }
  } catch (error) {
    console.error('Error initializing SMS service:', error.message);
    isConfigured = false;
    return false;
  }
};

const sendSMS = async (to, message, options = {}) => {
  try {
    // Ensure service is initialized
    if (!twilioClient && !initializeSMSService()) {
      return { success: false, error: 'SMS service not configured' };
    }

    if (!isConfigured || !twilioClient) {
      return { success: false, error: 'SMS service not configured' };
    }

    // Format phone number - ensure E.164 format
    const formattedTo = to.replace(/[^\d+]/g, '');
    
    // Add country code if missing (assuming +1 for now, can be configured)
    const finalTo = formattedTo.startsWith('+') 
      ? formattedTo 
      : `+${formattedTo}`;

    const messageParams = {
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: finalTo
    };

    // Add optional parameters if provided
    if (options.statusCallback) {
      messageParams.statusCallback = options.statusCallback;
    }

    // Retry logic with exponential backoff
    let lastError;
    const maxRetries = options.maxRetries || 2;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await twilioClient.messages.create(messageParams);
        
        return { 
          success: true, 
          messageId: result.sid,
          status: result.status,
          to: finalTo,
          attempts: attempt + 1
        };
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors (invalid numbers, etc.)
        if (error.code === 21211 || error.code === 21614) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    console.error('SMS sending error after retries:', lastError.message);
    return { 
      success: false, 
      error: lastError.message,
      code: lastError.code || 'UNKNOWN_ERROR'
    };
  } catch (error) {
    console.error('SMS sending error:', error.message);
    return { 
      success: false, 
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    };
  }
};

const isSMSConfigured = () => {
  return isConfigured && !!twilioClient;
};

module.exports = { 
  sendSMS, 
  initializeSMSService,
  isSMSConfigured
};
