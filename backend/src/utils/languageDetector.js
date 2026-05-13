const { franc } = require("franc");

const detectLanguage = (text) => {
  const langCode = franc(text);

  const languageMap = {
    hin: "Hindi",
    eng: "English",
    tam: "Tamil",
    tel: "Telugu",
    ben: "Bengali",
    mar: "Marathi",
    kan: "Kannada",
    guj: "Gujarati",
    mal: "Malayalam",
    pan: "Punjabi",
  };

  return languageMap[langCode] || "English";
};

module.exports = {
  detectLanguage,
};