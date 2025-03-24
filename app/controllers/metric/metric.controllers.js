import { influx } from "$app/connections/index.js";
import { databaseConfig } from "$app/config/index.js";

const { influx: influxConfig } = databaseConfig;

export const READ = async (req, res) => {
  const { host } = req.params;
  const { measurements } = req.body;
  const { start = "-1h", end = "now()" } = req.query;

  let queryMeasurements = "";
  const countMeasurements = measurements.length;
  measurements.forEach((measurement, index) => {
    const isLast = countMeasurements === index + 1;
    queryMeasurements += `r._measurement == "${measurement}"`;
    if (!isLast) queryMeasurements += " or ";
  });

  try {
    const queryAPI = influx.getQueryApi(influxConfig.org);

    const fluxQuery = `
      from(bucket: "${influxConfig.bucket}")
        |> range(start: ${start}, stop: ${end})
        |> filter(fn: (r) => 
          (${queryMeasurements}) 
          and r.host_id == "${host}"
        )
        |> keep(columns: ["_time", "_value", "_field", "_measurement", "host_id"])
    `;

    const metrics = await queryAPI.collectRows(fluxQuery);

    // Group data by measurement and field for a more compact structure
    const formattedMetrics = {};
    metrics.forEach(row => {
      const { _measurement, _field, _time, _value } = row;
      if (!formattedMetrics[_measurement]) {
        formattedMetrics[_measurement] = {};
      }
      if (!formattedMetrics[_measurement][_field]) {
        formattedMetrics[_measurement][_field] = [];
      }
      formattedMetrics[_measurement][_field].push({ time: _time, value: _value });
    });

    const response = {
      message: "Data fetched successfully",
      metrics: formattedMetrics,
    };

    const responseSize = Buffer.byteLength(JSON.stringify(response), "utf8");
    console.log(`Response size: ${responseSize} bytes`);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};