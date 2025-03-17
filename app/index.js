import express from "express";
import cors from "cors";
import morgan from "morgan";

import Routes from "$app/routes/index.js";
import { appConfig } from "$app/config/index.js";

const app = express();

// Morgan
app.use(
  morgan(appConfig.environment === "production" ? "combined" : "dev", {
    immediate: false,
  })
);

// Cors
app.use(
  cors({
    origin: ["https://cloud.openhubble.com", "http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

// Express
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(express.json({ limit: "10kb" }));
app.set("json spaces", 2);

app.use("/api", Routes);
app.use("*", (req, res) =>
  res.status(404).json({
    url: req.originalUrl,
    method: req.method,
    message: "Page not found",
    version: appConfig.version,
  })
);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
