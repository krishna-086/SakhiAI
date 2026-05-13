const processRiskAlert = async (analysis) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━");
    console.log("RISK ENGINE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━");

    const riskLevel =
      analysis?.risk_level?.toUpperCase() || "LOW";

    let alertTriggered = false;

    switch (riskLevel) {
      case "CRITICAL":
        console.log("🚨 CRITICAL ALERT");
        alertTriggered = true;
        break;

      case "HIGH":
        console.log("⚠️ HIGH RISK ALERT");
        alertTriggered = true;
        break;

      case "MEDIUM":
        console.log("🟡 MEDIUM RISK");
        break;

      default:
        console.log("🟢 LOW RISK");
    }

    return {
      riskLevel,
      alertTriggered,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error("Risk Engine Error:", error);

    throw error;
  }
};

module.exports = {
  processRiskAlert,
};