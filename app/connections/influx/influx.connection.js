// ----------------------------------------------
// $app/connections/influx
// influx.connections.js
// ----------------------------------------------
// Influx connection.
// Here we export the instance of InfluxDB.

import { InfluxDB } from "@influxdata/influxdb-client";

import { databaseConfig } from "$app/config/index.js";

const { influx: influxConfig } = databaseConfig;

const url = influxConfig.url;
const token = influxConfig.token;

const client = new InfluxDB({
  url,
  token,
});

console.log("InfluxDB connection established.");

export default client;
