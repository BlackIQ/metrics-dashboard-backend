import { influx } from "$app/connections/index.js";
import { databaseConfig } from "$app/config/index.js";

const { influx: influxConfig } = databaseConfig;

export const READ_METRICS = async (req, res) => {
  const { host } = req.params;
  const { measurements, fields } = req.body;
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

    let fluxQuery = `
      from(bucket: "${influxConfig.bucket}")
        |> range(start: ${start}, stop: ${end})
        |> filter(fn: (r) => 
          (${queryMeasurements}) 
          and r.host_id == "${host}"
        )
    `;

    if (fields && typeof fields === "object") {
      let fieldFilter = "";

      Object.entries(fields).forEach(([measurement, fieldList], index) => {
        if (Array.isArray(fieldList) && fieldList.length > 0) {
          const fieldConditions = fieldList
            .map((field) => `r._field == "${field}"`)
            .join(" or ");
          fieldFilter += `(r._measurement == "${measurement}" and (${fieldConditions}))`;

          if (index < Object.keys(fields).length - 1) fieldFilter += " or ";
        }
      });

      if (fieldFilter) {
        fluxQuery += `
          |> filter(fn: (r) => ${fieldFilter})
        `;
      }
    }

    fluxQuery += `
      |> keep(columns: ["_time", "_value", "_field", "_measurement", "host_id"])
    `;

    const metrics = await queryAPI.collectRows(fluxQuery);

    const formattedMetrics = {};

    metrics.forEach((row) => {
      const { _measurement, _field, _time, _value } = row;

      if (!formattedMetrics[_measurement]) {
        formattedMetrics[_measurement] = {};
      }

      if (!formattedMetrics[_measurement][_field]) {
        formattedMetrics[_measurement][_field] = [];
      }

      formattedMetrics[_measurement][_field].push({
        time: _time,
        value: _value,
      });
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

export const GET_KEYS = async (req, res) => {
  const { host } = req.params;

  try {
    const queryAPI = influx.getQueryApi(influxConfig.org);

    // Query measurements that contain the specified host_id
    const measurementsQuery = `
      from(bucket: "${influxConfig.bucket}")
        |> range(start: -30d)  // Adjust time range as needed
        |> filter(fn: (r) => r["host_id"] == "${host}")
        |> keep(columns: ["_measurement"])
        |> distinct(column: "_measurement")
    `;

    const measurements = await queryAPI.collectRows(measurementsQuery);
    const measurementNames = measurements.map((row) => row._measurement);

    const keysResult = {};

    for (const measurement of measurementNames) {
      const fieldsQuery = `
        import "influxdata/influxdb/schema"
        schema.measurementFieldKeys(
          bucket: "${influxConfig.bucket}",
          measurement: "${measurement}"
        )
      `;

      const fields = await queryAPI.collectRows(fieldsQuery);
      keysResult[measurement] = fields.map((row) => row._value);
    }

    const response = {
      message: "Keys fetched successfully",
      keys: keysResult,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching keys",
      error: error.message,
    });
  }
};
