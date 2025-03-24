import { redis } from "$app/connections/index.js";
import { Trigger, TriggerLog, Host, Alert } from "$app/models/index.js";
import logger from "$app/log/index.js";
import { sendEmail, sendTelegramMessage } from "$app/utils/index.js";

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

      for (const trigger of triggers) {
        const key = `trigger:${hostId}:${trigger._id}`;
        const problemKey = `${key}:problemId`; // Store problem log ID
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
          const relevantMetrics = value;

          const triggerLog = await TriggerLog.create({
            trigger: trigger._id,
            host: hostId,
            metrics: relevantMetrics,
            message: trigger.message,
          });

          logger.warn("Trigger fired", {
            context: "trigger",
            hostId,
            triggerId: trigger._id,
            message: trigger.message,
            metrics: { [queryKey]: value },
          });

          await redisPub.publish(
            "alerts:triggered",
            JSON.stringify({
              hostId,
              message: trigger.message,
              metrics: relevantMetrics,
            })
          );

          await redisState.set(
            problemKey,
            triggerLog._id.toString(),
            "EX",
            24 * 60 * 60
          );

          const host = await Host.findById(triggerLog.host).lean();
          if (!host || !host.user) {
            logger.warn("No user found for host", {
              context: "trigger",
              hostId,
            });
            continue;
          }

          const userId = host.user;
          const alerts = await Alert.find({
            user: userId,
            isActive: true,
          }).lean();

          for (const alert of alerts) {
            const metricText = `${queryKey} = ${triggerLog.metrics}`;
            const resolutionText = "New Problem";

            if (alert.type === "email") {
              // const emailContent = `
              //   OpenHubble Cloud 🔭

              //   Host: ${host.name}
              //   Alert: ${triggerLog.message} (${resolutionText})
              //   Metric: ${metricText}
              //   Trigger Log ID: ${triggerLog._id}
              //   Time: ${new Date().toISOString()}
              // `;

              // await sendEmail(
              //   alert.email,
              //   `OpenHubble: ${triggerLog.message} (${resolutionText})`,
              //   emailContent
              // );

              // logger.info("Email notification sent", {
              //   context: "trigger",
              //   userId,
              //   hostId: triggerLog.host,
              //   triggerId: triggerLog.trigger,
              //   triggerLogId: triggerLog._id,
              // });
              console.log("Email will implement (problem)");
            } else if (alert.type === "telegram") {
              const telegramMessage = [
                "OpenHubble Cloud 🔭",
                "",
                `Host: ${host.name}`,
                `Alert: ${triggerLog.message} (${resolutionText})`,
                `Metric: ${metricText}`,
                `Trigger Log ID: ${triggerLog._id}`,
                `Time: ${new Date().toISOString()}`,
              ].join("\n");

              await sendTelegramMessage(
                alert.config.chatID,
                alert.config.botToken,
                telegramMessage
              );

              logger.info("Telegram notification sent", {
                context: "trigger",
                userId,
                hostId: triggerLog.host,
                triggerId: triggerLog.trigger,
                triggerLogId: triggerLog._id,
              });
            }
          }
        } else if (!matches && state && trigger.resolution === "resolved") {
          await redisState.del(key);
          const relevantMetrics = value;

          const triggerLog = await TriggerLog.create({
            trigger: trigger._id,
            host: hostId,
            metrics: relevantMetrics,
            message: trigger.message,
          });

          logger.info("Trigger resolved", {
            context: "trigger",
            hostId,
            triggerId: trigger._id,
            message: trigger.message,
            metrics: { [queryKey]: value },
          });

          await redisPub.publish(
            "alerts:triggered",
            JSON.stringify({
              hostId,
              message: trigger.message,
              metrics: relevantMetrics,
            })
          );

          const problemLogId = await redisState.get(problemKey);
          await redisState.del(problemKey);

          const host = await Host.findById(triggerLog.host).lean();
          if (!host || !host.user) {
            logger.warn("No user found for host", {
              context: "trigger",
              hostId,
            });
            continue;
          }

          const userId = host.user;
          const alerts = await Alert.find({
            user: userId,
            isActive: true,
          }).lean();

          for (const alert of alerts) {
            const metricText = `${queryKey} = ${triggerLog.metrics}`;
            const resolutionText = problemLogId
              ? `Resolved (Problem ID: ${problemLogId})`
              : "Resolved";

            if (alert.type === "email") {
              // const emailContent = `
              //   OpenHubble Cloud 🔭

              //   Host: ${host.name}
              //   Alert: ${triggerLog.message} (${resolutionText})
              //   Metric: ${metricText}
              //   Trigger Log ID: ${triggerLog._id}
              //   Time: ${new Date().toISOString()}
              // `;

              // await sendEmail(
              //   alert.email,
              //   `OpenHubble: ${triggerLog.message} (${resolutionText})`,
              //   emailContent
              // );

              // logger.info("Email notification sent", {
              //   context: "trigger",
              //   userId,
              //   hostId: triggerLog.host,
              //   triggerId: triggerLog.trigger,
              //   triggerLogId: triggerLog._id,
              //   problemLogId,
              // });

              console.log("Email will implement (resolve)");
            } else if (alert.type === "telegram") {
              const telegramMessage = [
                "OpenHubble Cloud 🔭",
                "",
                `Host: ${host.name}`,
                `Alert: ${triggerLog.message} (${resolutionText})`,
                `Metric: ${metricText}`,
                `Trigger Log ID: ${triggerLog._id}`,
                `Time: ${new Date().toISOString()}`,
              ].join("\n");

              await sendTelegramMessage(
                alert.config.chatID,
                alert.config.botToken,
                telegramMessage
              );

              logger.info("Telegram notification sent", {
                context: "trigger",
                userId,
                hostId: triggerLog.host,
                triggerId: triggerLog.trigger,
                triggerLogId: triggerLog._id,
                problemLogId,
              });
            }
          }
        }
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
