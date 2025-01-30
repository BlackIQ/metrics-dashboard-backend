import { Point } from "@influxdata/influxdb-client";

import { Host } from "$app/models/index.js";
import { influx } from "$app/connections/index.js";

import { databaseConfig } from "$app/config/index.js";

import axios from "axios";
import chalk from "chalk";

const { influx: influxConfig } = databaseConfig;

export const pullMetrics = async () => {
  try {
    const hosts = await Host.find({ isActive: true });

    if (hosts.length === 0) {
      console.log("No active hosts found");
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

        const { data: hostData } = await axios.get(
          `${hostBaseUrl}/api/metrics`
        );

        const hostMetrics = hostData.metrics;

        // CPU
        const cpuPoint = new Point("host_cpu_metrics")
          .tag("host_id", String(host._id))
          .intField("total_cores", hostMetrics.cpu.total_cores)
          .floatField("total_usage", hostMetrics.cpu.total_usage)
          .floatField("frequency_mhz", hostMetrics.cpu.frequency_mhz)
          .timestamp(new Date());

        // Memory
        const memoryPoint = new Point("host_memory_metrics")
          .tag("host_id", String(host._id))
          .intField("total", hostMetrics.memory.total)
          .intField("available", hostMetrics.memory.available)
          .intField("used", hostMetrics.memory.used)
          .floatField("percent", hostMetrics.memory.percent)
          .timestamp(new Date());

        // Swap
        const swapPoint = new Point("host_swap_metrics")
          .tag("host_id", String(host._id))
          .intField("total", hostMetrics.swap.total)
          .intField("free", hostMetrics.swap.free ?? 0)
          .intField("used", hostMetrics.swap.used)
          .floatField("percent", hostMetrics.swap.percent)
          .timestamp(new Date());

        // Disk I/O
        const diskIOPoint = new Point("host_disk_io_metrics")
          .tag("host_id", String(host._id))
          .intField("read_bytes", hostMetrics.disk_io.read_bytes)
          .intField("write_bytes", hostMetrics.disk_io.write_bytes)
          .intField("read_count", hostMetrics.disk_io.read_count)
          .intField("write_count", hostMetrics.disk_io.write_count)
          .timestamp(new Date());

        // Network RX/TX
        const networkRTPoint = new Point("host_network_io_metrics")
          .tag("host_id", String(host._id))
          .intField("bytes_sent", hostMetrics.network_io.bytes_sent)
          .intField("bytes_received", hostMetrics.network_io.bytes_received)
          .intField("packets_sent", hostMetrics.network_io.packets_sent)
          .intField("packets_received", hostMetrics.network_io.packets_received)
          .timestamp(new Date());

        const systemLoadPoint = new Point("host_system_load_metrics")
          .tag("host_id", String(host._id))
          .floatField("1_min", hostMetrics.system_load["1_min"])
          .floatField("5_min", hostMetrics.system_load["5_min"])
          .floatField("15_min", hostMetrics.system_load["15_min"])
          .timestamp(new Date());

        if (host.dockerMetrics) {
          const { data: dockerData } = await axios.get(
            `${hostBaseUrl}/api/metrics/docker`
          );

          const dockerMetrics = dockerData.metrics;

          dockerMetrics.forEach((container) => {
            const {
              id,
              name,
              cpu,
              memory,
              blkio_stats,
              networks,
              status,
              health,
              pids,
            } = container;

            // CPU Metrics for Docker container
            const cpuPoint = new Point("docker_cpu_metrics")
              .tag("host_id", String(host._id))
              .tag("container_id", id)
              .tag("container_name", name)
              .floatField("cpu_percentage", cpu.cpu_percentage)
              .intField("cpu_usage", cpu.cpu_usage)
              .timestamp(new Date());

            // Memory Metrics for Docker container
            const memoryPoint = new Point("docker_memory_metrics")
              .tag("host_id", String(host._id))
              .tag("container_id", id)
              .tag("container_name", name)
              .intField("memory_limit", memory.memory_limit)
              .floatField("memory_percentage", memory.memory_percentage)
              .intField("memory_usage", memory.memory_usage)
              .timestamp(new Date());

            // Disk I/O Metrics for Docker container
            const diskIOPoint = new Point("docker_disk_io_metrics")
              .tag("host_id", String(host._id))
              .tag("container_id", id)
              .tag("container_name", name)
              .intField("read_bytes", blkio_stats.read_bytes)
              .intField("write_bytes", blkio_stats.write_bytes)
              .timestamp(new Date());

            // Network Metrics for Docker container
            const networkPoint = new Point("docker_network_metrics")
              .tag("host_id", String(host._id))
              .tag("container_id", id)
              .tag("container_name", name)
              .intField("rx_bytes", networks.eth0.rx_bytes)
              .intField("tx_bytes", networks.eth0.tx_bytes)
              .timestamp(new Date());

            // PID Metrics for Docker container
            const pidPoint = new Point("docker_pid_metrics")
              .tag("host_id", String(host._id))
              .tag("container_id", id)
              .tag("container_name", name)
              .intField("pids", pids)
              .timestamp(new Date());

            // Container Health and Status
            const statusPoint = new Point("docker_container_status")
              .tag("host_id", String(host._id))
              .tag("container_id", id)
              .tag("container_name", name)
              .stringField("status", status)
              .stringField("health", health)
              .timestamp(new Date());

            // Write all Docker container points
            writeAPI.writePoint(cpuPoint);
            writeAPI.writePoint(memoryPoint);
            writeAPI.writePoint(diskIOPoint);
            writeAPI.writePoint(networkPoint);
            writeAPI.writePoint(pidPoint);
            writeAPI.writePoint(statusPoint);

            console.log(
              chalk.green(
                `[${new Date().toISOString()}] [Docker] Metrics successfully fetched for ${name}`
              )
            );
          });
        }

        // Write all points
        writeAPI.writePoint(cpuPoint);
        writeAPI.writePoint(memoryPoint);
        writeAPI.writePoint(swapPoint);
        writeAPI.writePoint(diskIOPoint);
        writeAPI.writePoint(networkRTPoint);
        writeAPI.writePoint(systemLoadPoint);

        const now = new Date().toISOString();

        console.log(
          chalk.green(
            `[${now}] [Host] Metrics successfully fetched from ${host.name}`
          )
        );
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
