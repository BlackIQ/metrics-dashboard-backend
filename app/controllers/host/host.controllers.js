// Models
import { Host } from "$app/models/index.js";

// Logger
import logger from "$app/log/index.js";

// Libs
import axios from "axios";

export const ALL = async (req, res) => {
  const { page, limit } = req.query;
  const user = req.user.id;

  try {
    const hosts = await Host.find({ user })
      .populate("user", "email firstName")
      .populate("groups", "label value")
      .populate("tags", "name value")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Host.countDocuments({ user });

    logger.info("Hosts fetched", {
      context: "host",
      userId: user,
      page,
      limit,
      total,
    });

    return res.status(200).json({
      message: "Hosts fetched",
      hosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Hosts fetch failed", {
      context: "host",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to fetch hosts" });
  }
};

export const CREATE = async (req, res) => {
  const data = req.body;
  const user = req.user.id;

  try {
    const host = await Host.create({ ...data, user });

    logger.info("Host created", {
      context: "host",
      resourceType: "host",
      resourceId: host._id.toString(),
      userId: user,
    });

    return res.status(201).json({ message: "Host created", host });
  } catch (error) {
    logger.error("Host creation failed", {
      context: "host",
      error: error.message,
      stack: error.stack,
      userId: user,
    });

    if (error.code === 11000) {
      return res.status(409).json({ message: "Host already exists" });
    }

    return res.status(500).json({ message: "Failed to create host" });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const host = await Host.findById(id)
      .populate("user", "email firstName")
      .populate("groups", "label value")
      .populate("tags", "name value")
      .lean();

    if (!host) {
      logger.warn("Host not found", {
        context: "host",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Host not found" });
    }

    logger.info("Host retrieved", {
      context: "host",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Host retrieved", host });
  } catch (error) {
    logger.error("Host retrieval failed", {
      context: "host",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to retrieve host" });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const host = await Host.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!host) {
      logger.warn("Host not found for update", {
        context: "host",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Host not found" });
    }

    logger.info("Host updated", {
      context: "host",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Host updated", host });
  } catch (error) {
    logger.error("Host update failed", {
      context: "host",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    if (error.code === 11000) {
      return res.status(409).json({ message: "Host already exists" });
    }

    return res.status(500).json({ message: "Failed to update host" });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const host = await Host.findByIdAndDelete(id);

    if (!host) {
      logger.warn("Host not found for deletion", {
        context: "host",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Host not found" });
    }

    logger.info("Host deleted", {
      context: "host",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(204).json();
  } catch (error) {
    logger.error("Host deletion failed", {
      context: "host",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to delete host" });
  }
};

export const CHECK = async (req, res) => {
  const { host } = req.body;

  try {
    const hostBaseUrl = `http://${host.ipCommunication ? host.ip : host.dns}:${
      host.port
    }`;

    const { data: ping } = await axios.get(`${hostBaseUrl}/api/ping`, {
      timeout: 5000,
    });

    if (ping.message !== "pong") {
      logger.warn("Host ping invalid", {
        context: "host",
        userId: req.user.id,
        host: hostBaseUrl,
      });

      return res.status(503).json({ message: "Host ping response invalid" });
    }

    logger.info("Host check successful", {
      context: "host",
      userId: req.user.id,
      host: hostBaseUrl,
    });

    return res.status(200).json({ message: "Host is ok!" });
  } catch (error) {
    logger.error("Host check failed", {
      context: "host",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
      host: `${host.ipCommunication ? host.ip : host.dns}:${host.port}`,
    });

    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      return res.status(503).json({ message: "Host is unreachable" });
    }

    return res.status(500).json({ message: "Failed to check host" });
  }
};
