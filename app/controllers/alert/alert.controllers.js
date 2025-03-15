import { Alert } from "$app/models/index.js";

import axios from "axios";

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
    return res.status(500).send({ message: error.message });
  }
};

export const CREATE = async (req, res) => {
  const { uid } = req.headers;
  const { type, config } = req.body;

  if (!uid) {
    return res.status(400).send({ message: "User ID is required" });
  }

  if (!["telegram", "email"].includes(type)) {
    return res.status(400).send({ message: "Invalid alert type" });
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

    return res.status(200).send({ message: "Alert created", alert: newAlert });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const { config, isActive } = req.body;

  try {
    const alert = await Alert.findById(id);

    if (!alert) {
      return res.status(404).send({ message: "Alert not found" });
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

    return res.status(200).send({ message: "Alert updated", alert });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const alert = await Alert.findOneAndDelete({ _id: id });

    if (!alert) {
      return res.status(404).send({ message: "Alert did not found" });
    }

    return res.status(200).send({ message: "Alert deleted" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const sendTelegramMessage = async (chatID, botToken, message) => {
  const payload = {
    chat_id: chatID,
    text: message,
  };

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      payload
    );

    if (!response.data.ok) {
      throw new Error(`Telegram API error: ${response.data.description}`);
    }

    return response.data;
  } catch (error) {
    throw new Error(`Failed to send Telegram message: ${error.message}`);
  }
};

export const TEST_ALERT = async (req, res) => {
  const { config, type } = req.body;

  try {
    if (!type) {
      return res.status(500).send({ message: "Type is required" });
    }

    if (type === "telegram") {
      if (!config.chatID || !config.botToken) {
        return res
          .status(400)
          .send({ message: "chatID and botToken are required for Telegram" });
      }

      const messages = [
        "OpenHubble Cloud",
        "",
        "This is a test to check setup :)",
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
        return res.status(500).send({
          message: telegramError.message,
        });
      }
    } else if (type === "email") {
      if (!config.destinationEmail) {
        return res
          .status(400)
          .send({ message: "destinationEmail is required for Email alerts" });
      }

      return res
        .status(200)
        .send({ message: "Email test message sent successfully" });
    } else {
      return res.status(500).send({ message: "Type is not found" });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
