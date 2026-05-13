const fs = require("fs");

const groq = require("../config/groq");

const transcribeAudio = async (filePath) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━");
    console.log("STARTING TRANSCRIPTION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━");

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-large-v3",
      response_format: "text",
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━");
    console.log("TRANSCRIPTION COMPLETE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━");

    return transcription;
  } catch (error) {
    console.error("Groq Whisper Error:", error);

    throw error;
  }
};

module.exports = {
  transcribeAudio,
};