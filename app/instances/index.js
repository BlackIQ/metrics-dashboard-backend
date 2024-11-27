// ----------------------------------------------
// $app/connections
// index.js
// ----------------------------------------------
// Exporting all databse connections.
// Like configs, create them in directories and export them here.

import redis from "$app/connections/redis/redis.connection.js";
import mongo from "$app/connections/mongo/mongo.connection.js";
import influx from "$app/connections/influx/influx.connection.js";

export { redis, mongo, influx };
