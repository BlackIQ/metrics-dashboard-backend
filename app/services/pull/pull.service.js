import axios from "axios";
import { Host, AgentAction } from "$app/models/index.js";
import { influx } from "$app/connections/index.js";
import { databaseConfig } from "$app/config/index.js";
import logger from "$app/log/index.js";
import { Point } from "@influxdata/influxdb-client";

const { influx: influxConfig } = databaseConfig;

export const pullMetrics = async () => {
  try {
    const hosts = await Host.find({ isActive: true }).lean();
    if (hosts.length === 0) {
      logger.warn("No active hosts found", { context: "pull" });
      return;
    }

    logger.info("Starting metrics pull", {
      context: "pull",
      hostCount: hosts.length,
    });

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
          headers: { "x-api-key": host.apiKey },
        });

        if (ping.message !== "pong") {
          throw new Error("Ping response invalid");
        }

        await AgentAction.create({
          host: host._id,
          status: "active",
          message: "Agent ping successful",
        });

        if (!host.agentAvailable) {
          await Host.updateOne(
            { _id: host._id },
            { $set: { agentAvailable: true } }
          );

          logger.info("Host agent marked available", {
            context: "pull",
            hostId: host._id,
            hostName: host.name,
          });
        }

        const { data: hostData } = await axios.get(
          `${hostBaseUrl}/api/metrics`,
          {
            timeout: 5000,
            headers: { "x-api-key": host.apiKey },
          }
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

        // System Load
        const systemLoadPoint = new Point("host_system_load_metrics")
          .tag("host_id", String(host._id))
          .floatField("1_min", hostMetrics.system_load["1_min"])
          .floatField("5_min", hostMetrics.system_load["5_min"])
          .floatField("15_min", hostMetrics.system_load["15_min"])
          .timestamp(new Date());

        if (host.dockerMetrics) {
          const { data: dockerData } = await axios.get(
            `${hostBaseUrl}/api/metrics/docker`,
            {
              headers: { "x-api-key": host.apiKey },
            }
          );

          const dockerMetrics = dockerData.metrics;

          for (const container of dockerMetrics) {
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
            if (status === "exited") continue;

            await AgentAction.create({
              host: host._id,
              status: "active",
              message: `Docker container ${name} metrics fetched`,
            });

            // Docker Points
            const cpuPoint = new Point("docker_cpu_metrics")
              .tag("host_id", String(host._id))
              .tag("container_id", id)
              .tag("container_name", name)
              .floatField("cpu_percentage", parseFloat(cpu.cpu_percentage))
              .intField("cpu_usage", cpu.cpu_usage)
              .timestamp(new Date());

            const memoryPoint = new Point("docker_memory_metrics")
              .tag("host_id", String(host._id))
              .tag("container_id", id)
              .tag("container_name", name)
              .intField("memory_limit", memory.memory_limit)
              .floatField("memory_percentage", memory.memory_percentage)
              .intField("memory_usage", memory.memory_usage)
              .timestamp(new Date());

            const diskIOPoint = new Point("docker_disk_io_metrics")
              .tag("host_id", String(host._id))
              .tag("container_id", id)
              .tag("container_name", name)
              .intField("read_bytes", blkio_stats.read_bytes)
              .intField("write_bytes", blkio_stats.write_bytes)
              .timestamp(new Date());

            const networkPoint = new Point("docker_network_metrics")
              .tag("host_id", String(host._id))
              .tag("container_id", id)
              .tag("container_name", name)
              .intField("rx_bytes", networks.eth0.rx_bytes)
              .intField("tx_bytes", networks.eth0.tx_bytes)
              .timestamp(new Date());

            const pidPoint = new Point("docker_pid_metrics")
              .tag("host_id", String(host._id))
              .tag("container_id", id)
              .tag("container_name", name)
              .intField("pids", pids)
              .timestamp(new Date());

            const statusPoint = new Point("docker_container_status")
              .tag("host_id", String(host._id))
              .tag("container_id", id)
              .tag("container_name", name)
              .stringField("status", status)
              .stringField("health", health)
              .timestamp(new Date());

            writeAPI.writePoint(cpuPoint);
            writeAPI.writePoint(memoryPoint);
            writeAPI.writePoint(diskIOPoint);
            writeAPI.writePoint(networkPoint);
            writeAPI.writePoint(pidPoint);
            writeAPI.writePoint(statusPoint);

            logger.info("Docker metrics fetched", {
              context: "pull",
              hostId: host._id,
              containerId: id,
              containerName: name,
            });
          }
        }

        // Write host points
        writeAPI.writePoint(cpuPoint);
        writeAPI.writePoint(memoryPoint);
        writeAPI.writePoint(swapPoint);
        writeAPI.writePoint(diskIOPoint);
        writeAPI.writePoint(networkRTPoint);
        writeAPI.writePoint(systemLoadPoint);

        logger.info("Host metrics pull successful", {
          context: "pull",
          hostId: host._id,
          hostName: host.name,
        });
      } catch (error) {
        let errorMessage = error.message;
        let errorStatus = "unavailable";

        if (axios.isAxiosError(error)) {
          if (error.response) {
            errorMessage = `Status ${error.response.status}: ${
              error.response.data?.message || "Unknown error"
            }`;
            errorStatus = "error";
          } else if (error.request) {
            errorMessage = "No response from agent";
          }
        }

        await AgentAction.create({
          host: host._id,
          status: errorStatus,
          message: errorMessage,
        });

        logger.error("Host metrics pull failed", {
          context: "pull",
          hostId: host._id,
          hostName: host.name,
          error: errorMessage,
          stack: error.stack,
        });

        if (host.agentAvailable) {
          await Host.updateOne(
            { _id: host._id },
            { $set: { agentAvailable: false } }
          );

          logger.info("Host agent marked unavailable", {
            context: "pull",
            hostId: host._id,
            hostName: host.name,
          });
        }
      }
    });

    await Promise.all(tasks);
    await writeAPI.flush();

    logger.info("Metrics pull completed", {
      context: "pull",
      hostCount: hosts.length,
    });
  } catch (error) {
    logger.error("Pull metrics failed", {
      context: "pull",
      error: error.message,
      stack: error.stack,
    });
  }
};
