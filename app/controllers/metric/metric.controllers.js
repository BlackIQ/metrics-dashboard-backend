import { Point } from "@influxdata/influxdb-client";

import { Host } from "$app/models/index.js";
import { influx } from "$app/connections/index.js";
import { databaseConfig } from "$app/config/index.js";
import axios from "axios";

const { influx: influxConfig } = databaseConfig;

export const PULL = async (req, res) => {
  try {
    const hosts = await Host.find();

    const host = hosts[0];

    const hostBaseUrl = `http://${host.ipCommunication ? host.ip : host.dns}:${
      host.port
    }`;

    try {
      const { data: metrics } = await axios.get(`${hostBaseUrl}/api/metrics`);

      const writeAPI = influx.getWriteApi(
        influxConfig.org,
        influxConfig.bucket,
        "ns"
      );

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
        .intField(
          "free",
          metrics.swap.free !== undefined ? metrics.swap.free : 0
        )
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

      // Disk Space (for each disk)
      const diskPoints = Object.entries(metrics.disk_space).map(
        ([disk, data]) =>
          new Point("disk_space_metrics")
            .tag("host_id", String(host._id))
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
      console.log(error);
      return res.status(500).send({ message: error });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: error.message });
  }
};

export const READ = async (req, res) => {
  const { host } = req.params;
  const { start = "-1h", end = "now()" } = req.query;

  try {
    const queryAPI = influx.getQueryApi(influxConfig.org);

    const fluxQuery = `
      from(bucket: "${influxConfig.bucket}")
        |> range(start: ${start}, stop: ${end})
        |> filter(fn: (r) => 
          (r._measurement == "system_load_metrics" or r._measurement == "cpu_metrics") 
          and r.host_id == "${host}"
        )
    `;

    const results = await queryAPI.collectRows(fluxQuery);

    console.log(results.length);

    return res
      .status(200)
      .send({ message: "Data fetched successfully", results });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
