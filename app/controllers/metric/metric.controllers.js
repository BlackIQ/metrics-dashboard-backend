import { influx } from "$app/connections/index.js";
import { databaseConfig } from "$app/config/index.js";

const { influx: influxConfig } = databaseConfig;

export const READ = async (req, res) => {
  const { host } = req.params;
  const { measurements } = req.body;
  const { start = "-1h", end = "now()" } = req.query;

  let queryMeasurements = "";

  const countMeasurements = measurements.length;
  measurements.map((measurement, index) => {
    const isLast = countMeasurements == index + 1;

    queryMeasurements += `r._measurement == "${measurement}"`;

    if (!isLast) {
      queryMeasurements += " or ";
    }
  });

  //  (r._measurement == "system_load_metrics" or r._measurement == "cpu_metrics")

  try {
    const queryAPI = influx.getQueryApi(influxConfig.org);

    const fluxQuery = `
      from(bucket: "${influxConfig.bucket}")
        |> range(start: ${start}, stop: ${end})
        |> filter(fn: (r) => 
          (${queryMeasurements}) 
          and r.host_id == "${host}"
        )
    `;

    const metrics = await queryAPI.collectRows(fluxQuery);

    const response = {
      message: "Data fetched successfully",
      metrics,
    };

    const responseSize = Buffer.byteLength(JSON.stringify(response), "utf8");
    console.log(`Response size: ${responseSize} bytes`);

    return res.status(200).send(response);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
