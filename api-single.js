import { appConfig } from "$app/config/index.js";
import logger from "$app/log/index.js";

import app from "$app";

import os from "os";

app.listen(appConfig.port, () => {
  logger.info("App is running", {
    context: "app",
    port: appConfig.port,
    env: appConfig.environment,
    host: os.hostname(),
    version: appConfig.version,
  });
});
