// Andromeda
import { pullService, triggerService } from "$app/andromeda/index.js";

import logger from "$app/log/index.js";
import { appConfig } from "$app/config/index.js";

const POLL_INTERVAL = appConfig.pollInterval || 5000;

export const startEventDriven = () => {
  logger.info("Starting event-driven services", {
    context: "service",
    interval: POLL_INTERVAL,
  });

  triggerService().catch((error) => {
    logger.error("Trigger service failed to start", {
      context: "service",
      error: error.message,
      stack: error.stack,
    });
  });

  let isRunning = false;
  let intervalId = null;

  const poll = async () => {
    if (isRunning) {
      logger.debug("Metrics poll skipped - still running", {
        context: "service",
      });
      return;
    }

    isRunning = true;
    try {
      await pullService();
      logger.debug("Metrics poll completed", { context: "service" });
    } catch (error) {
      logger.error("Metrics collection failed", {
        context: "service",
        error: error.message,
        stack: error.stack,
      });
    } finally {
      isRunning = false;
    }
  };

  intervalId = setInterval(poll, POLL_INTERVAL);

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      logger.info("Metrics collection stopped", { context: "service" });
    }
  };

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  return stop;
};
