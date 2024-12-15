import { Host } from "$app/models/index.js";
import { influx } from "$app/connections/index.js";
import { databaseConfig } from "$app/config/index.js";

const { influx: influxConfig } = databaseConfig;

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
