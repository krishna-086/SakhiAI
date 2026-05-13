const express = require("express");
const cors = require("cors");

const whatsappRoutes = require("./routes/whatsapp.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const uploadRoutes = require("./routes/upload.routes");

const app = express();

app.use(cors());
app.use("/api", uploadRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/webhook", whatsappRoutes);
app.use("/api", dashboardRoutes);

module.exports = app;