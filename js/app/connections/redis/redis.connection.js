// ----------------------------------------------
// $app/connections/redis
// redis.connections.js
// ----------------------------------------------
// Redis connection.
// Here we export the instance of Redis.

import redis from "ioredis";

import { databaseConfig } from "$app/config/index.js";

const { redis: redisConfig } = databaseConfig;

const url = redisConfig.connection;

const client = new redis(url);

export default client;
