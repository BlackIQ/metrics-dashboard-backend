import { Point } from "@influxdata/influxdb-client";

import { influx } from "$app/connections/index.js";
import { databaseConfig } from "$app/config/index.js";

const { influx: influxConfig } = databaseConfig;

export const CREATE = async (req, res) => {
  const metrics = req.body;
  const { server } = req.headers;

  try {
    const writeAPI = influx.getWriteApi(influxConfig.org, "amir-10", "ns");

    // CPU
    const cpuPoint = new Point("cpu_metrics")
      .tag("server_id", String(server._id))
      .intField("total_cores", metrics.cpu.total_cores)
      .floatField("total_usage", metrics.cpu.total_usage)
      .floatField("frequency_mhz", metrics.cpu.frequency_mhz)
      .timestamp(new Date());

    // Memory
    const memoryPoint = new Point("memory_metrics")
      .tag("server_id", String(server._id))
      .intField("total", metrics.memory.total)
      .intField("available", metrics.memory.available)
      .intField("used", metrics.memory.used)
      .floatField("percent", metrics.memory.percent)
      .timestamp(new Date());

    // Swap
    const swapPoint = new Point("swap_metrics")
      .tag("server_id", String(server._id))
      .intField("total", metrics.swap.total)
      .intField("free", metrics.swap.free !== undefined ? metrics.swap.free : 0)  // Fallback to 0 if undefined or any invalid value
      .intField("used", metrics.swap.used)
      .floatField("percent", metrics.swap.percent)
      .timestamp(new Date());

    // Disk I/O
    const diskIOPoint = new Point("disk_io_metrics")
      .tag("server_id", String(server._id))
      .intField("read_bytes", metrics.disk_io.read_bytes)
      .intField("write_bytes", metrics.disk_io.write_bytes)
      .intField("read_count", metrics.disk_io.read_count)
      .intField("write_count", metrics.disk_io.write_count)
      .timestamp(new Date());

    // Network RX/TX
    const networkRTPoint = new Point("network_io_metrics")
      .tag("server_id", String(server._id))
      .intField("bytes_sent", metrics.network_io.bytes_sent)
      .intField("bytes_received", metrics.network_io.bytes_received)
      .intField("packets_sent", metrics.network_io.packets_sent)
      .intField("packets_received", metrics.network_io.packets_received)
      .timestamp(new Date());

    // System Load
    const systemLoadPoint = new Point("system_load_metrics")
      .tag("server_id", String(server._id))
      .floatField("1_min", metrics.system_load["1_min"])
      .floatField("5_min", metrics.system_load["5_min"])
      .floatField("15_min", metrics.system_load["15_min"])
      .timestamp(new Date());

    // Disk Space (for each disk)
    const diskPoints = Object.entries(metrics.disk_space).map(([disk, data]) =>
      new Point("disk_space_metrics")
        .tag("server_id", String(server._id))
        .tag("disk", disk)
        .intField("total", data.total)
        .intField("used", data.used)
        .intField("free", data.free)
        .floatField("percent", data.percent)
        .timestamp(new Date())
    );

    // Write all points
    writeAPI.writePoint(cpuPoint);
    writeAPI.writePoint(memoryPoint);
    writeAPI.writePoint(swapPoint);
    writeAPI.writePoint(diskIOPoint);
    writeAPI.writePoint(networkRTPoint);
    writeAPI.writePoint(systemLoadPoint);
    diskPoints.forEach((point) => writeAPI.writePoint(point));

    // Flush the data
    await writeAPI.flush();

    return res.status(200).send({ message: "Metrics got" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: error.message });
  }
};

export const READ = async (req, res) => {};
