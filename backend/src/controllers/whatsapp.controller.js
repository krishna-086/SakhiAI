const axios = require("axios");
const fs = require("fs");
const path = require("path");

const {
  saveScreening,
  saveAlert,
} = require("../services/database.service");

const {
  transcribeAudio,
} = require("../services/whisper.service");

const {
  generateMedicalResponse,
} = require("../services/llm.service");

const {
  processRiskAlert,
} = require("../services/risk.service");

const {
  sendWhatsAppMessage,
} = require("../services/twilio.service");

const uploadsDir = path.join(__dirname, "../../uploads");

// ENSURE UPLOADS DIRECTORY EXISTS
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const whatsappWebhook = async (req, res) => {
  try {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[WEBHOOK] TWILIO WEBHOOK HIT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━");

    const numMedia = parseInt(req.body.NumMedia || "0");

    const sender = req.body.From;

    console.log("[WEBHOOK] Sender:", sender);
    console.log("[WEBHOOK] Number of media files:", numMedia);

    // FAST ACK FOR TWILIO
    res.status(200).send("Webhook received");

    // TEXT MESSAGE
    if (numMedia === 0) {
      console.log("[TEXT] Message:", req.body.Body);

      return;
    }

    // MEDIA INFO
    const mediaUrl = req.body.MediaUrl0;
    const mediaType = req.body.MediaContentType0;

    console.log("[MEDIA] URL:", mediaUrl);
    console.log("[MEDIA] Type:", mediaType);

    // ONLY HANDLE AUDIO
    if (!mediaType.includes("audio")) {
      console.log("[MEDIA] Non-audio media ignored");

      return;
    }

    console.log("[AUDIO] Voice message detected");

    // UNIQUE FILE NAME
    const fileName = `voice-${Date.now()}.ogg`;

    const filePath = path.join(uploadsDir, fileName);

    // DOWNLOAD AUDIO
    console.log("[AUDIO_DOWNLOAD] Downloading audio...");

    const response = await axios({
      method: "GET",
      url: mediaUrl,
      responseType: "stream",
      timeout: 30000,

      auth: {
        username: process.env.TWILIO_ACCOUNT_SID,
        password: process.env.TWILIO_AUTH_TOKEN,
      },
    });

    // SAVE AUDIO
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    // WAIT FOR FILE SAVE
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("[AUDIO_DOWNLOAD] Audio saved successfully");
    console.log("[AUDIO_DOWNLOAD] Saved at:", filePath);

    // TRANSCRIBE AUDIO
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[TRANSCRIPTION] STARTED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━");

    const transcript = await transcribeAudio(filePath);

    // VALIDATE TRANSCRIPT
    if (!transcript || transcript.trim().length < 3) {
      throw new Error("Invalid or empty transcript");
    }

    console.log("[TRANSCRIPTION] Final Transcript:");
    console.log(transcript);

    // GENERATE AI RESPONSE
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[LLM] GENERATING RESPONSE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━");

    const aiResponse = await generateMedicalResponse(
      transcript
    );

    console.log("[LLM] AI Response:");
    console.log(aiResponse);

    // PROCESS RISK ANALYSIS
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[RISK_ENGINE] ANALYZING");
    console.log("━━━━━━━━━━━━━━━━━━━━━━");

    const riskData = await processRiskAlert(
      aiResponse
    );

    console.log("[RISK_ENGINE] Output:");
    console.log(riskData);

    // SAVE SCREENING TO DATABASE
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[DATABASE] SAVING SCREENING");
    console.log("━━━━━━━━━━━━━━━━━━━━━━");

    await saveScreening({
      sender,

      transcript,

      risk_level: aiResponse.risk_level,

      possible_concern:
        aiResponse.possible_concern,

      recommended_action:
        aiResponse.recommended_action,

      response_for_user:
        aiResponse.response_for_user,

      warning_signs:
        aiResponse.warning_signs,
    });

    // SAVE ALERT FOR HIGH/CRITICAL CASES
    if (
      riskData.riskLevel === "HIGH" ||
      riskData.riskLevel === "CRITICAL"
    ) {
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━");
      console.log("[DATABASE] SAVING ALERT");
      console.log("━━━━━━━━━━━━━━━━━━━━━━");

      await saveAlert({
        sender,

        transcript,

        risk_level: riskData.riskLevel,

        possible_concern:
          aiResponse.possible_concern,
      });
    }

    // DETERMINE FINAL USER RESPONSE
    const finalResponse =
      aiResponse?.response_for_user ||
      "Sorry, I could not understand properly.";

    // SEND WHATSAPP MESSAGE
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[TWILIO_REPLY] SENDING MESSAGE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━");

    await sendWhatsAppMessage(
      sender,
      finalResponse
    );

    console.log(
      "[TWILIO_REPLY] Message sent successfully"
    );

    // CLEANUP AUDIO FILE
    try {
      await fs.promises.unlink(filePath);

      console.log("[CLEANUP] Audio file deleted");
    } catch (cleanupError) {
      console.error(
        "[CLEANUP] Failed to delete file:",
        cleanupError
      );
    }

  } catch (error) {
    console.error("\n━━━━━━━━━━━━━━━━━━━━━━");
    console.error("[PIPELINE_ERROR]");
    console.error("━━━━━━━━━━━━━━━━━━━━━━");

    console.error(error);
  }
};

module.exports = {
  whatsappWebhook,
};