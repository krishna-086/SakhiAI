const supabase = require("../config/supabase");

// GET ALL SCREENINGS
const getScreenings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("screenings")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("[GET SCREENINGS ERROR]", error);

    return res.status(500).json({
      error: "Failed to fetch screenings",
    });
  }
};

// GET ALERTS
const getAlerts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("[GET ALERTS ERROR]", error);

    return res.status(500).json({
      error: "Failed to fetch alerts",
    });
  }
};

// GET DASHBOARD STATS
const getStats = async (req, res) => {
  try {

    const { count: totalScreenings } =
      await supabase
        .from("screenings")
        .select("*", {
          count: "exact",
          head: true,
        });

    const { count: totalAlerts } =
      await supabase
        .from("alerts")
        .select("*", {
          count: "exact",
          head: true,
        });

    const { count: highRiskCases } =
      await supabase
        .from("screenings")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("risk_level", "HIGH");

    const { count: mediumRiskCases } =
      await supabase
        .from("screenings")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("risk_level", "MEDIUM");

    return res.status(200).json({
      totalScreenings,
      totalAlerts,
      highRiskCases,
      mediumRiskCases,
    });

  } catch (error) {
    console.error("[GET STATS ERROR]", error);

    return res.status(500).json({
      error: "Failed to fetch stats",
    });
  }
};

module.exports = {
  getScreenings,
  getAlerts,
  getStats,
};