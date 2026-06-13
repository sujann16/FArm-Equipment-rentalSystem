const fs = require('fs');
const path = require('path');

const sendWhatsAppMessage = async (to, message) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER || '+14155238886'; // Twilio sandbox number

  if (accountSid && authToken) {
    try {
      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);
      
      await client.messages.create({
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${to}`,
        body: message
      });

      console.log(`Live WhatsApp message sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending live Twilio WhatsApp message:', error.message);
    }
  }

  // Simulation Fallback: Append to localized log file
  try {
    const logFilePath = path.join(__dirname, '../../whatsapp_notifications.log');
    const timestamp = new Date().toISOString();
    const divider = '='.repeat(60);
    const logEntry = `
${divider}
[WHATSAPP NOTIFICATION SENT] - ${timestamp}
To: ${to}
From: whatsapp:${fromNumber} (MOCK)
Message:
${message}
${divider}
`;

    fs.appendFileSync(logFilePath, logEntry, 'utf8');
    console.log(`Simulated WhatsApp notification written to: ${logFilePath}`);
    return true;
  } catch (err) {
    console.error('Error writing simulated WhatsApp message to file:', err.message);
    return false;
  }
};

module.exports = { sendWhatsAppMessage };
