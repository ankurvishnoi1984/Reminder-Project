const nodemailer = require('nodemailer');

let transporter = null;

const initializeEmailService = () => {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendEmail = async (to, subject, body,attachments) => {
  try {
    if (!transporter) {
      initializeEmailService();
    }

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: to,
      subject: subject,
      html: body,
      attachments:attachments
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail, initializeEmailService };
