import cluster from "cluster";
import os from "os";
import { appConfig } from "$app/config/index.js";
import logger from "$app/log/index.js";
import app from "$app";

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  logger.info("Starting cluster", {
    context: "cluster",
    cores: numCPUs,
    pid: process.pid,
  });

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("online", (worker) => {
    logger.info("Worker online", {
      context: "cluster",
      workerPid: worker.process.pid,
    });
  });

  cluster.on("exit", (worker, code, signal) => {
    logger.warn("Worker exited", {
      context: "cluster",
      workerPid: worker.process.pid,
      code,
      signal,
    });
    
    cluster.fork();
  });
} else {
  app.listen(appConfig.port, () => {
    logger.info("App is running", {
      context: "app",
      port: appConfig.port,
      env: appConfig.environment,
      host: os.hostname(),
      version: appConfig.version,
      workerPid: process.pid,
    });
  });
}
