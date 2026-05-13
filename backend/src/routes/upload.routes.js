const express = require("express");

const multer = require("multer");

const path = require("path");

const fs = require("fs");

const ffmpeg = require("fluent-ffmpeg");

const ffmpegPath = require("ffmpeg-static");

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

ffmpeg.setFfmpegPath(ffmpegPath);

const router = express.Router();

const uploadsDir = path.join(
  __dirname,
  "../../uploads"
);

// ENSURE UPLOADS DIRECTORY EXISTS
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {
    recursive: true,
  });
}

// MULTER STORAGE
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, uploadsDir);
  },

  filename: (_, file, cb) => {
    cb(
      null,
      `upload-${Date.now()}${path.extname(
        file.originalname
      )}`
    );
  },
});

const upload = multer({
  storage,
});

// ROUTE
router.post(
  "/upload-audio",
  upload.single("audio"),

  async (req, res) => {
    try {
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━");
      console.log("[UPLOAD_ROUTE]");
      console.log("━━━━━━━━━━━━━━━━━━━━━━");

      const filePath = req.file.path;

      console.log(
        "[FILE] Uploaded:",
        filePath
      );

      // CONVERT WEBM TO MP3
      const convertedPath =
        filePath.replace(
          ".webm",
          ".mp3"
        );

      console.log(
        "[FFMPEG] Converting audio..."
      );

      await new Promise(
        (resolve, reject) => {
          ffmpeg(filePath)

            .toFormat("mp3")

            .on("end", () => {
              console.log(
                "[FFMPEG] Conversion complete"
              );

              resolve();
            })

            .on("error", (err) => {
              console.error(
                "[FFMPEG_ERROR]",
                err
              );

              reject(err);
            })

            .save(convertedPath);
        }
      );

      // TRANSCRIBE
      console.log(
        "[TRANSCRIPTION] Starting..."
      );

      const transcript =
        await transcribeAudio(
          convertedPath
        );

      console.log(
        "[TRANSCRIPT]"
      );

      console.log(transcript);

      // GENERATE AI RESPONSE
      console.log(
        "[LLM] Generating response..."
      );

      const aiResponse =
        await generateMedicalResponse(
          transcript
        );

      console.log(
        "[AI_RESPONSE]"
      );

      console.log(aiResponse);

      // RISK ENGINE
      const riskData =
        await processRiskAlert(
          aiResponse
        );

      console.log(
        "[RISK_DATA]"
      );

      console.log(riskData);

      // PREPARE DATABASE OBJECT
      const screeningData = {
        sender: "WEB_APP",

        transcript,

        risk_level:
          aiResponse.risk_level,

        possible_concern:
          aiResponse.possible_concern,

        recommended_action:
          aiResponse.recommended_action,

        response_for_user:
          aiResponse.response_for_user,

        warning_signs:
          aiResponse.warning_signs,
      };

      // SAVE SCREENING
      console.log(
        "[DATABASE] Saving screening..."
      );

      await saveScreening(
        screeningData
      );

      // SAVE ALERT
      console.log(
        "[DATABASE] Saving alert..."
      );

      await saveAlert(
        screeningData
      );

      // CLEANUP FILES
      try {
        await fs.promises.unlink(
          filePath
        );

        await fs.promises.unlink(
          convertedPath
        );

        console.log(
          "[CLEANUP] Files deleted"
        );

      } catch (cleanupError) {
        console.error(
          "[CLEANUP_ERROR]",
          cleanupError
        );
      }

      // FINAL RESPONSE
      return res.status(200).json({
        transcript,
        aiResponse,
        riskData,
      });

    } catch (error) {
      console.error(
        "\n━━━━━━━━━━━━━━━━━━━━━━"
      );

      console.error(
        "[UPLOAD_ROUTE_ERROR]"
      );

      console.error(
        "━━━━━━━━━━━━━━━━━━━━━━"
      );

      console.error(error);

      return res.status(500).json({
        error:
          "Failed to process audio",
      });
    }
  }
);

module.exports = router;