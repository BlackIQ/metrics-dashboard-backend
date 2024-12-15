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
        const { data } = await axios.get(`${hostBaseUrl}/api/metrics`);

        const metrics = data.metrics;

        // CPU
        const cpuPoint = new Point("cpu_metrics")
          .tag("host_id", String(host._id))
          .intField("total_cores", metrics.cpu.total_cores)
          .floatField("total_usage", metrics.cpu.total_usage)
          .floatField("frequency_mhz", metrics.cpu.frequency_mhz)
          .timestamp(new Date());

        // Memory
        const memoryPoint = new Point("memory_metrics")
          .tag("host_id", String(host._id))
          .intField("total", metrics.memory.total)
          .intField("available", metrics.memory.available)
          .intField("used", metrics.memory.used)
          .floatField("percent", metrics.memory.percent)
          .timestamp(new Date());

        // Swap
        const swapPoint = new Point("swap_metrics")
          .tag("host_id", String(host._id))
          .intField("total", metrics.swap.total)
          .intField("free", metrics.swap.free ?? 0)
          .intField("used", metrics.swap.used)
          .floatField("percent", metrics.swap.percent)
          .timestamp(new Date());

        // Disk I/O
        const diskIOPoint = new Point("disk_io_metrics")
          .tag("host_id", String(host._id))
          .intField("read_bytes", metrics.disk_io.read_bytes)
          .intField("write_bytes", metrics.disk_io.write_bytes)
          .intField("read_count", metrics.disk_io.read_count)
          .intField("write_count", metrics.disk_io.write_count)
          .timestamp(new Date());

        // Network RX/TX
        const networkRTPoint = new Point("network_io_metrics")
          .tag("host_id", String(host._id))
          .intField("bytes_sent", metrics.network_io.bytes_sent)
          .intField("bytes_received", metrics.network_io.bytes_received)
          .intField("packets_sent", metrics.network_io.packets_sent)
          .intField("packets_received", metrics.network_io.packets_received)
          .timestamp(new Date());

        // System Load
        const systemLoadPoint = new Point("system_load_metrics")
          .tag("host_id", String(host._id))
          .floatField("1_min", metrics.system_load["1_min"])
          .floatField("5_min", metrics.system_load["5_min"])
          .floatField("15_min", metrics.system_load["15_min"])
          .timestamp(new Date());

        // Write all points
        writeAPI.writePoint(cpuPoint);
        writeAPI.writePoint(memoryPoint);
        writeAPI.writePoint(swapPoint);
        writeAPI.writePoint(diskIOPoint);
        writeAPI.writePoint(networkRTPoint);
        writeAPI.writePoint(systemLoadPoint);

        const now = new Date().toISOString();

        console.log(
          chalk.green(`[${now}] Metrics successfully fetched from ${host.name}`)
        );
      } catch (error) {
        console.log(
          chalk.red(
            `[${now}] Failed to fetch metrics from ${host.hostname} at ${hostBaseUrl}`
          )
        );
      }
    });

    await Promise.allSettled(tasks);

    await writeAPI.flush();
  } catch (error) {
    console.error("Error in pullMetrics:", error.message);
  }
};
