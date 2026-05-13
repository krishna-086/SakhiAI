const express = require("express");

const router = express.Router();

const {
  getScreenings,
  getAlerts,
  getStats,
} = require("../controllers/dashboard.controller");

router.get("/screenings", getScreenings);

router.get("/alerts", getAlerts);

router.get("/stats", getStats);

module.exports = router;