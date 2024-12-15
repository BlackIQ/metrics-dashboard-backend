import { pullMetrics } from "$app/services/index.js";

export const startMetricsCollection = () => {
  console.log("Starting metrics collection...");
  let isRunning = false;

  setInterval(async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      await pullMetrics();
    } catch (error) {
      console.error("Error in metrics collection:", error);
    } finally {
      isRunning = false;
    }
  }, 1000);
};
