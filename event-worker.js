// Andromeda
import { startEventDriven } from "$app/andromeda/index.js";

import { appConfig } from "$app/config/index.js";
import logger from "$app/log/index.js";

import os from "os";

logger.info("Starting event-driven worker", {
  context: "worker",
  env: appConfig.environment,
  host: os.hostname(),
  version: appConfig.version,
  pid: process.pid,
});

const stop = startEventDriven();

process.on("SIGINT", () => {
  stop();

  logger.info("Event-driven worker stopped", {
    context: "worker",
    env: appConfig.environment,
    host: os.hostname(),
    version: appConfig.version,
    pid: process.pid,
    signal: "SIGINT",
  });
  process.exit(0);
});

process.on("SIGTERM", () => {
  stop();

  logger.info("Event-driven worker stopped", {
    context: "worker",
    env: appConfig.environment,
    host: os.hostname(),
    version: appConfig.version,
    pid: process.pid,
    signal: "SIGTERM",
  });

  process.exit(0);
});
