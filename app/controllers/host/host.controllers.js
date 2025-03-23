// Models
import { Host, AgentAction } from "$app/models/index.js";

// Logger
import logger from "$app/log/index.js";

// Libs
import axios from "axios";

// export const ALL = async (req, res) => {
//   const { page, limit } = req.query;
//   const user = req.user.id;

//   try {
//     const hosts = await Host.find({ user })
//       .populate("user", "email firstName")
//       .populate("groups", "label value")
//       .populate("tags", "name value")
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .lean();

//     const total = await Host.countDocuments({ user });

//     logger.info("Hosts fetched", {
//       context: "host",
//       userId: user,
//       page,
//       limit,
//       total,
//     });

//     return res.status(200).json({
//       message: "Hosts fetched",
//       hosts,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     logger.error("Hosts fetch failed", {
//       context: "host",
//       error: error.message,
//       stack: error.stack,
//       userId: req.user.id,
//     });

//     return res.status(500).json({ message: "Failed to fetch hosts" });
//   }
// };

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

    if (ping.message !== "pong") throw new Error("Ping response invalid");

    await AgentAction.create({
      host: host._id,
      status: "active",
      message: "Ping successful",
    });

    logger.info("Host check successful", {
      context: "host",
      userId: req.user.id,
      host: hostBaseUrl,
    });

    return res.status(200).json({ message: "Host is ok!" });
  } catch (error) {
    await AgentAction.create({
      host: host._id,
      status: "unavailable",
      message: error.message,
    });

    logger.error("Host check failed", {
      context: "host",
      error: error.message,
      userId: req.user.id,
    });

    return res.status(503).json({ message: "Host is unreachable" });
  }
};

export const ACTIONS = async (req, res) => {
  const { page, limit } = req.query;
  const { id } = req.params;
  const user = req.user.id;

  try {
    const actions = await AgentAction.find({ host: id })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await AgentAction.countDocuments({ host: id });

    logger.info("Hosts actions fetched", {
      context: "host",
      userId: user,
      page,
      limit,
      total,
    });

    return res.status(200).json({
      message: "Host actions fetched",
      hosts: actions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Host actions fetch failed", {
      context: "host",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to fetch hosts actions" });
  }
};

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

    const hostsWithLatestAction = await Promise.all(
      hosts.map(async (host) => {
        const latestAction = await AgentAction.findOne({ host: host._id })
          .sort({ timestamp: -1 })
          .lean();

        return {
          ...host,
          latestActionMessage: latestAction ? latestAction.message : null,
        };
      })
    );

    const total = await Host.countDocuments({ user });

    logger.info("Hosts fetched with latest action", {
      context: "host",
      userId: user,
      page,
      limit,
      total,
    });

    return res.status(200).json({
      message: "Hosts fetched with latest action",
      hosts: hostsWithLatestAction,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Hosts fetch with latest action failed", {
      context: "host",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    return res
      .status(500)
      .json({ message: "Failed to fetch hosts and actions" });
  }
};
