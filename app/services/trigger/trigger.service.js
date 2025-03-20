import { redis } from "$app/connections/index.js";
import { Trigger, TriggerLog } from "$app/models/index.js";
import logger from "$app/log/index.js";

const redisSub = redis.duplicate();
const redisPub = redis.duplicate();
const redisState = redis;

export const triggerService = async () => {
  logger.info("Starting trigger service", { context: "trigger" });

  const triggers = await Trigger.find({ isActive: true }).lean();

  logger.info("Loaded default triggers", {
    context: "trigger",
    count: triggers.length,
  });

  redisSub.subscribe("metrics:updates", (err) => {
    if (err) {
      logger.error("Redis subscription failed", {
        context: "trigger",
        error: err.message,
      });
    } else {
      logger.info("Subscribed to metrics:updates", { context: "trigger" });
    }
  });

  redisSub.on("message", async (channel, message) => {
    try {
      const { hostId, metrics } = JSON.parse(message);
      const triggerLogs = [];

      for (const trigger of triggers) {
        const key = `trigger:${hostId}:${trigger._id}`;
        const queryKey = Object.keys(trigger.query)[0];
        const condition = trigger.query[queryKey];

        const value = queryKey.split(".").reduce((obj, k) => obj?.[k], metrics);
        const matches =
          value !== undefined &&
          (("$gt" in condition && value > condition.$gt) ||
            ("$lt" in condition && value < condition.$lt) ||
            ("$gte" in condition && value >= condition.$gte) ||
            ("$lte" in condition && value <= condition.$lte) ||
            ("$eq" in condition && value === condition.$eq) ||
            ("$ne" in condition && value !== condition.$ne));

        const state = await redisState.get(key);

        if (matches && !state && trigger.resolution === "problem") {
          await redisState.set(key, "active", "EX", 24 * 60 * 60);

          const relevantMetrics = { [queryKey]: value };

          triggerLogs.push({
            trigger: trigger._id,
            host: hostId,
            metrics: relevantMetrics,
          });

          logger.warn("Trigger fired", {
            context: "trigger",
            hostId,
            triggerId: trigger._id,
            message: trigger.message,
            metrics: relevantMetrics,
          });

          await redisPub.publish(
            "alerts:triggered",
            JSON.stringify({
              hostId,
              message: trigger.message,
              metrics: relevantMetrics,
            })
          );
        } else if (!matches && state && trigger.resolution === "resolved") {
          triggerLogs.push({
            trigger: trigger._id,
            host: hostId,
            metrics,
            message: trigger.message,
          });

          await redisState.del(key);

          const relevantMetrics = { [queryKey]: value };

          logger.info("Trigger resolved", {
            context: "trigger",
            hostId,
            triggerId: trigger._id,
            message: trigger.message,
            metrics: relevantMetrics,
          });

          await redisPub.publish(
            "alerts:triggered",
            JSON.stringify({
              hostId,
              message: trigger.message,
              metrics: relevantMetrics,
            })
          );
        }
      }

      if (triggerLogs.length) {
        await TriggerLog.insertMany(triggerLogs, { ordered: false });

        logger.debug("Trigger logs recorded", {
          context: "trigger",
          count: triggerLogs.length,
        });
      }
    } catch (error) {
      logger.error("Trigger processing failed", {
        context: "trigger",
        error: error.message,
        stack: error.stack,
        message,
      });
    }
  });
};
