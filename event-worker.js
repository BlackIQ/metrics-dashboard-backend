import { startEventDriven } from "$app/services/index.js";
import logger from "$app/log/index.js";

logger.info("Starting event-driven worker", {
  context: "worker",
  pid: process.pid,
});

const stop = startEventDriven();

process.on("SIGINT", () => {
  stop();
  logger.info("Worker stopped", { context: "worker" });
  process.exit(0);
});
process.on("SIGTERM", () => {
  stop();
  logger.info("Worker stopped", { context: "worker" });
  process.exit(0);
});
