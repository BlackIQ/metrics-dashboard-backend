import { appConfig } from "$app/config/index.js";
import { startMetricsCollection } from "$app/services/index.js";
import logger from "$app/log/index.js";

import app from "$app";

import os from "os";

app.listen(appConfig.port, () => {
  logger.info("App is running", {
    context: "app", // Category: app lifecycle
    port: appConfig.port, // Specific detail
    env: appConfig.environment, // Environment
    host: os.hostname(), // Server identifier
    version: appConfig.version, // App version for tracking updates
  });

  if (appConfig.environment === "production") {
    startMetricsCollection();
  }
});
