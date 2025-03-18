import { pullMetrics } from "$app/services/index.js";

import logger from "$app/log/index.js";

import { appConfig } from "$app/config/index.js";

const POLL_INTERVAL = appConfig.pollInterval || 5000;

export const startMetricsCollection = () => {
  logger.info("Starting metrics collection", {
    context: "service",
    interval: POLL_INTERVAL,
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
      await pullMetrics();

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
