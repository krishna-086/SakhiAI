const supabase = require("../config/supabase");

const saveScreening = async (data) => {
  try {
    const { error } = await supabase
      .from("screenings")
      .insert([data]);

    if (error) {
      throw error;
    }

    console.log("[DATABASE] Screening saved");

  } catch (error) {
    console.error("[DATABASE ERROR]", error);

    throw error;
  }
};

const saveAlert = async (data) => {
  try {
    const { error } = await supabase
      .from("alerts")
      .insert([data]);

    if (error) {
      throw error;
    }

    console.log("[DATABASE] Alert saved");

  } catch (error) {
    console.error("[DATABASE ERROR]", error);

    throw error;
  }
};

module.exports = {
  saveScreening,
  saveAlert,
};