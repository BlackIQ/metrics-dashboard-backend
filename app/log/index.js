// Winston
import winston from "winston";
import { MongoDB } from "winston-mongodb";

// Stuff
import path from "path";

// Database Log
import { logMongo } from "$app/connections/index.js";

// File log
import { fileConfig, appConfig } from "$app/config/index.js";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new MongoDB({
      db: logMongo,
      collection: appConfig.environment === "production" ? "logs" : "dev-logs",
      level: "info",
      storeHost: true,
      capped: true,
      cappedSize: 10000000,
      tryReconnect: true,
    }),
    new winston.transports.File({
      filename: path.join(fileConfig.filePath, "app.log"),
      level: "info",
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

logger.info("Logging initialized", { context: "startup" });

export default logger;
