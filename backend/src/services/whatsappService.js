const twilio = require('twilio');

let twilioClient = null;
let isConfigured = false;

const initializeWhatsAppService = () => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (accountSid && authToken && whatsappNumber) {
      twilioClient = twilio(accountSid, authToken);
      isConfigured = true;
      console.log('WhatsApp service initialized successfully');
      return true;
    } else {
      console.warn('WhatsApp service not fully configured. Missing required environment variables.');
      isConfigured = false;
      return false;
    }
  } catch (error) {
    console.error('Error initializing WhatsApp service:', error.message);
    isConfigured = false;
    return false;
  }
};

const sendWhatsApp = async (to, message, options = {}) => {
  try {
    // Ensure service is initialized
    if (!twilioClient && !initializeWhatsAppService()) {
      return { success: false, error: 'WhatsApp service not configured' };
    }

    if (!isConfigured || !twilioClient) {
      return { success: false, error: 'WhatsApp service not configured' };
    }

    // Format phone number - remove any non-digit characters except +
    const formattedTo = to.replace(/[^\d+]/g, '');
    
    // Ensure whatsapp: prefix is applied correctly
    const twilioTo = formattedTo.startsWith('whatsapp:') 
      ? formattedTo 
      : `whatsapp:${formattedTo}`;

    // Validate WhatsApp number format
    const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
    
    const messageParams = {
      body: message,
      from: whatsappFrom,
      to: twilioTo
    };

    // Add optional parameters if provided
    if (options.statusCallback) {
      messageParams.statusCallback = options.statusCallback;
    }

    const result = await twilioClient.messages.create(messageParams);

    return { 
      success: true, 
      messageId: result.sid,
      status: result.status,
      to: twilioTo
    };
  } catch (error) {
    console.error('WhatsApp sending error:', error.message);
    return { 
      success: false, 
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    };
  }
};

const isWhatsAppConfigured = () => {
  return isConfigured && !!twilioClient;
};

module.exports = { 
  sendWhatsApp, 
  initializeWhatsAppService,
  isWhatsAppConfigured
};
