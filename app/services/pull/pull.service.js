import { Point } from "@influxdata/influxdb-client";

import { Host } from "$app/models/index.js";
import { influx } from "$app/connections/index.js";

import { databaseConfig } from "$app/config/index.js";

import axios from "axios";
import chalk from "chalk";

const { influx: influxConfig } = databaseConfig;

export const pullMetrics = async () => {
  try {
    const hosts = await Host.find();

    if (hosts.length === 0) {
      console.log("No hosts found");
      return;
    }

    const writeAPI = influx.getWriteApi(
      influxConfig.org,
      influxConfig.bucket,
      "ns"
    );

    const tasks = hosts.map(async (host) => {
      const hostBaseUrl = `http://${
        host.ipCommunication ? host.ip : host.dns
      }:${host.port}`;

      try {
        const { data: ping } = await axios.get(`${hostBaseUrl}/api/ping`, {
          timeout: 5000,
        });

        if (ping.message !== "pong") {
          throw new Error("Ping response invalid");
        }

        if (!host.agentAvailable) {
          await Host.updateOne(
            { _id: host._id },
            { $set: { agentAvailable: true } }
          );
        }

        const now = new Date().toISOString();
        console.log(
          chalk.green(`[${now}] Metrics successfully fetched from ${host.name}`)
        );

        // Fetch and process metrics (if needed)
        // const { data: metrics } = await axios.get(`${hostBaseUrl}/api/metrics`);
        // Process and write metrics to InfluxDB...
      } catch (error) {
        const now = new Date().toISOString();

        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.log(
              chalk.red(
                `[${now}] Failed to fetch metrics from ${host.name} at ${hostBaseUrl} - Status: ${error.response.status}`
              )
            );
          } else if (error.request) {
            console.log(
              chalk.red(
                `[${now}] Failed to fetch metrics from ${host.name} at ${hostBaseUrl} - No response`
              )
            );
          } else {
            console.log(
              chalk.red(
                `[${now}] Failed to fetch metrics from ${host.name} at ${hostBaseUrl} - Error: ${error.message}`
              )
            );
          }
        } else {
          console.log(
            chalk.red(
              `[${now}] Failed to fetch metrics from ${host.name} at ${hostBaseUrl} - Error: ${error.message}`
            )
          );
        }

        if (host.agentAvailable) {
          await Host.updateOne(
            { _id: host._id },
            { $set: { agentAvailable: false } }
          );
        }
      }
    });

    await Promise.all(tasks);

    await writeAPI.flush();
  } catch (error) {
    console.error("Error in pullMetrics:", error.message);
  }
};
