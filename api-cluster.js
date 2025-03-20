import { appConfig } from "$app/config/index.js";
import logger from "$app/log/index.js";
import app from "$app";

import cluster from "cluster";
import os from "os";

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  logger.info("Starting API cluster", {
    context: "cluster",
    cores: numCPUs,
    pid: process.pid,
  });

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("online", (worker) => {
    logger.info("API worker online", {
      context: "cluster",
      workerPid: worker.process.pid,
    });
  });

  cluster.on("exit", (worker, code, signal) => {
    logger.warn("API worker exited", {
      context: "cluster",
      workerPid: worker.process.pid,
      code,
      signal,
    });
    cluster.fork();
  });
} else {
  app.listen(appConfig.port, () => {
    logger.info("App is running (clustered)", {
      context: "app",
      port: appConfig.port,
      env: appConfig.environment,
      host: os.hostname(),
      version: appConfig.version,
      workerPid: process.pid,
    });
  });
}
