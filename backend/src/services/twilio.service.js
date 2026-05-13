const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsAppMessage = async (to, body) => {
  try {
    const message = await client.messages.create({
      from: "whatsapp:+14155238886",
      to,
      body,
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━");
    console.log("WHATSAPP REPLY SENT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━");

    console.log(message.sid);

    return message;
  } catch (error) {
    console.error("Twilio Send Error:", error);

    throw error;
  }
};

module.exports = {
  sendWhatsAppMessage,
};