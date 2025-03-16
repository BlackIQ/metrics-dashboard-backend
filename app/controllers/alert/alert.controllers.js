import { Alert } from "$app/models/index.js";
import { sendTelegramMessage, sendEmail } from "$app/utils/index.js";

const baseAlerts = [
  {
    name: "Telegram",
    identifier: "telegram",
    details: "Send alert via Telegram",
  },
  {
    name: "Email",
    identifier: "email",
    details: "Get alerts using Email",
  },
  // {
  //   name: "Webhook",
  //   identifier: "webhook",
  //   details: "Send alert to your own custom API",
  // },
];

export const ALL = async (req, res) => {
  const { uid } = req.headers;

  try {
    const userAlerts = await Alert.find({ user: uid });

    const alertsWithStatus = baseAlerts.map((alert) => {
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
        type: userAlert ? userAlert.type : null,
        user: userAlert ? userAlert.user : null,
      };
    });

    return res.status(200).json({
      message: "User alert settings",
      alerts: alertsWithStatus,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const CREATE = async (req, res) => {
  const { uid } = req.headers;
  const { type, config } = req.body;

  if (!uid) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!["telegram", "email"].includes(type)) {
    return res.status(400).json({ message: "Invalid alert type" });
  }

  if (type === "telegram" && (!config.chatID || !config.botToken)) {
    return res
      .status(400)
      .send({ message: "chatID and botToken are required for Telegram" });
  }
  if (type === "email" && !config.destinationEmail) {
    return res
      .status(400)
      .send({ message: "destinationEmail is required for Email alerts" });
  }

  try {
    const existingAlert = await Alert.findOne({ user: uid, type });

    if (existingAlert) {
      return res
        .status(409)
        .send({ message: "Alert already exists, use update instead" });
    }

    const newAlert = await Alert.create({
      user: uid,
      type,
      config,
      isActive: true,
    });

    return res.status(200).json({ message: "Alert created", alert: newAlert });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const { config, isActive } = req.body;

  try {
    const alert = await Alert.findById(id);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // Convert isActive to a boolean if it's provided
    const updatedIsActive =
      typeof isActive !== "undefined"
        ? isActive === true || isActive === "true"
        : alert.isActive;

    // If config exists, validate based on alert type
    if (config) {
      if (alert.type === "telegram" && (!config.chatID || !config.botToken)) {
        return res
          .status(400)
          .send({ message: "chatID and botToken are required for Telegram" });
      }
      if (alert.type === "email" && !config.destinationEmail) {
        return res
          .status(400)
          .send({ message: "destinationEmail is required for Email alerts" });
      }

      alert.config = config;
    }

    alert.isActive = updatedIsActive;
    await alert.save();

    return res.status(200).json({ message: "Alert updated", alert });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const alert = await Alert.findOneAndDelete({ _id: id });

    if (!alert) {
      return res.status(404).json({ message: "Alert did not found" });
    }

    return res.status(200).json({ message: "Alert deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const TEST_ALERT = async (req, res) => {
  const { config, type } = req.body;

  try {
    if (!type) {
      return res.status(500).json({ message: "Type is required" });
    }

    if (type === "telegram") {
      if (!config.chatID || !config.botToken) {
        return res
          .status(400)
          .send({ message: "chatID and botToken are required for Telegram" });
      }

      const messages = [
        "OpenHubble Cloud 🔭",
        "",
        "Your account is now connected to Telegram.",
        "Stay tuned for real-time alerts directly here! 🚀",
      ];

      try {
        await sendTelegramMessage(
          config.chatID,
          config.botToken,
          messages.join("\n")
        );
        return res
          .status(200)
          .send({ message: "Telegram test message sent successfully" });
      } catch (telegramError) {
        return res.status(500).json({
          message: telegramError.message,
        });
      }
    }

    if (type === "email") {
      if (!config.destinationEmail) {
        return res
          .status(400)
          .send({ message: "destinationEmail is required for Email alerts" });
      }

      const emailContent = `
        <p style="font-size: 18px; color: #00FFFF;">OpenHubble Cloud 🔭</p>
        <p>&nbsp;</p>
        <p>Your account is now connected to Email.</p>
        <p>Stay tuned for real-time alerts directly in your inbox! 🚀</p>
      `;

      await sendEmail(
        config.destinationEmail,
        "Welcome to OpenHubble Cloud Alerts",
        emailContent
      );

      return res
        .status(200)
        .send({ message: "Email test message sent successfully" });
    }

    return res.status(500).json({ message: "Type is not found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
