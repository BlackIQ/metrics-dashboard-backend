// Models
import { Alert } from "$app/models/index.js";

// Logger
import logger from "$app/log/index.js";

// Utils
import { sendTelegramMessage, sendEmail } from "$app/utils/index.js";

const baseAlerts = [
  {
    name: "Telegram",
    identifier: "telegram",
    type: "telegram",
    details: "Send alert via Telegram",
  },
  {
    name: "Email",
    identifier: "email",
    type: "email",
    details: "Get alerts using Email",
  },
  // { name: "Webhook", identifier: "webhook", details: "Send alert to your own custom API" },
];

export const ALL = async (req, res) => {
  const { page, limit } = req.query;
  const user = req.user.id;

  try {
    const userAlerts = await Alert.find({ user })
      .skip((page - 1) * limit)
      .lean();

    const total = await Alert.countDocuments({ user });

    const allAlerts = baseAlerts.map((alert) => {
      const userAlert = userAlerts.find((ua) => ua.type === alert.identifier);
      return {
        ...alert,
        alertStatus: userAlert
          ? userAlert.isActive
            ? "active"
            : "inactive"
          : "non-exists",
        _id: userAlert ? userAlert._id : null,
        config: userAlert ? userAlert.config : null,
        type: alert.type,
        user: userAlert ? userAlert.user : null,
      };
    });

    const paginatedAlerts = allAlerts.slice((page - 1) * limit, page * limit);

    logger.info("Alerts fetched", {
      context: "alert",
      userId: user,
      page,
      limit,
      total,
    });

    return res.status(200).json({
      message: "User alert settings",
      alerts: paginatedAlerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Alerts fetch failed", {
      context: "alert",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to fetch alerts" });
  }
};

export const CREATE = async (req, res) => {
  const user = req.user.id;
  const { type, config } = req.body;

  try {
    const existingAlert = await Alert.findOne({ user, type });

    if (existingAlert) {
      logger.warn("Alert already exists", {
        context: "alert",
        userId: user,
        type,
      });

      return res
        .status(409)
        .json({ message: "Alert already exists, use update instead" });
    }

    const newAlert = await Alert.create({ user, type, config, isActive: true });

    logger.info("Alert created", {
      context: "alert",
      resourceType: "alert",
      resourceId: newAlert._id.toString(),
      userId: user,
    });

    return res.status(201).json({ message: "Alert created", alert: newAlert });
  } catch (error) {
    logger.error("Alert creation failed", {
      context: "alert",
      error: error.message,
      stack: error.stack,
      userId: user,
    });

    return res.status(500).json({ message: "Failed to create alert" });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const { config, isActive } = req.body;

  try {
    const alert = await Alert.findById(id);

    if (!alert) {
      logger.warn("Alert not found for update", {
        context: "alert",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Alert not found" });
    }

    if (config) {
      alert.config = config;
    }

    if (typeof isActive !== "undefined") {
      alert.isActive = isActive === true || isActive === "true";
    }

    await alert.save();

    logger.info("Alert updated", {
      context: "alert",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Alert updated", alert });
  } catch (error) {
    logger.error("Alert update failed", {
      context: "alert",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to update alert" });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const alert = await Alert.findByIdAndDelete(id);

    if (!alert) {
      logger.warn("Alert not found for deletion", {
        context: "alert",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Alert not found" });
    }

    logger.info("Alert deleted", {
      context: "alert",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(204).json();
  } catch (error) {
    logger.error("Alert deletion failed", {
      context: "alert",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to delete alert" });
  }
};

export const TEST_ALERT = async (req, res) => {
  const { config, type } = req.body;

  try {
    if (type === "telegram") {
      const messages = [
        "OpenHubble Cloud 🔭",
        "",
        "Your account is now connected to Telegram.",
        "Stay tuned for real-time alerts directly here! 🚀",
      ];

      await sendTelegramMessage(
        config.chatID,
        config.botToken,
        messages.join("\n")
      );

      logger.info("Telegram test sent", {
        context: "alert",
        userId: req.user.id,
        type,
      });

      return res
        .status(200)
        .json({ message: "Telegram test message sent successfully" });
    }

    if (type === "email") {
      const emailContent = `
        <p style="font-size: 18px; color: #00FFFF;">OpenHubble Cloud 🔭</p>
        <p> </p>
        <p>Your account is now connected to Email.</p>
        <p>Stay tuned for real-time alerts directly in your inbox! 🚀</p>
      `;

      await sendEmail(
        config.destinationEmail,
        "Welcome to OpenHubble Cloud Alerts",
        emailContent
      );

      logger.info("Email test sent", {
        context: "alert",
        userId: req.user.id,
        type,
      });

      return res
        .status(200)
        .json({ message: "Email test message sent successfully" });
    }
  } catch (error) {
    logger.error("Test alert failed", {
      context: "alert",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
      type,
    });

    return res
      .status(500)
      .json({ message: `Failed to send ${type} test: ${error.message}` });
  }
};
