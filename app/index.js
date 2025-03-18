// Express
import express from "express";

// Libs
import cors from "cors";
import morgan from "morgan";
import jwt from "jsonwebtoken";

// Logger
import logger from "$app/log/index.js";

// Routes
import Routes from "$app/routes/index.js";

// Config
import { appConfig } from "$app/config/index.js";

// Middleware
import { ratelimit, verifyToken } from "$app/middlewares/index.js";

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

app.use(verifyToken);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info("Request processed", {
      context: "request",
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || "unauthenticated",
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
  });

  return next();
});

// Rate Limit
app.use(ratelimit);

// API
app.use("/api", Routes);

// 404
app.use("*", (req, res) =>
  res.status(404).json({
    url: req.originalUrl,
    method: req.method,
    message: "Page not found",
    version: appConfig.version,
  })
);

// Error handling (example)
app.use((err, req, res, next) => {
  logger.error("Unhandled error", {
    context: "server",
    error: err.message,
    stack: err.stack,
    path: req.path,
    userId: req.user?.id || "unauthenticated",
  });

  return res.status(500).json({ message: "Something went wrong" });
});

export default app;
