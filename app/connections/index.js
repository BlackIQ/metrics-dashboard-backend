// ----------------------------------------------
// $app/connections
// index.js
// ----------------------------------------------
// Exporting all databse connections.
// Like configs, create them in directories and export them here.

import Redis from "$app/connections/redis/redis.connection.js";
import mongo from "$app/connections/mongo/mongo.connection.js";

export { Redis, mongo };
