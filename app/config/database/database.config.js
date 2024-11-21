// ----------------------------------------------
// $app/config/database
// database.config.js
// ----------------------------------------------
// Databases configurations.
// Here we export database data, like mongodb, redis and etc.

import env from "$app/env/index.js";

export default {
  mongo: {
    connection: env.MONGO_CONNNECTION_STRING,
  },
  redis: {
    connection: env.REDIS_CONNNECTION_STRING,
  },
  influx: {
    url: env.INFLUX_URL,
    token: env.INFLUX_TOKEN,
    org: env.INFLUX_ORG,
    bucket: env.INFLUX_BUCKET,
  },
};
