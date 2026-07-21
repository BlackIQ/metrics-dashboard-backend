// Models
import { TriggerLog } from "$app/models/index.js";

// Logger
import logger from "$app/log/index.js";

export const ALL = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const triggerLogs = await TriggerLog.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await TriggerLog.countDocuments();

    logger.info("TriggerLogs fetched", {
      context: "triggerLog",
      userId: req.user.id,
      page,
      limit,
      total,
    });

    return res.status(200).json({
      message: "TriggerLogs fetched",
      triggerLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("TriggerLogs fetch failed", {
      context: "triggerLog",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to fetch triggerLogs" });
  }
};

export const CREATE = async (req, res) => {
  const data = req.body;

  try {
    const triggerLog = await TriggerLog.create(data);

    logger.info("TriggerLog created", {
      context: "triggerLog",
      resourceType: "triggerLog",
      resourceId: triggerLog._id.toString(),
      userId: req.user.id,
    });

    return res.status(201).json({ message: "TriggerLog created", triggerLog });
  } catch (error) {
    logger.error("TriggerLog creation failed", {
      context: "triggerLog",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "TriggerLog name already exists" });
    }

    return res.status(500).json({ message: "Failed to create triggerLog" });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const triggerLog = await TriggerLog.findById(id).lean();

    if (!triggerLog) {
      logger.warn("TriggerLog not found", {
        context: "triggerLog",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "TriggerLog not found" });
    }

    logger.info("TriggerLog retrieved", {
      context: "triggerLog",
      resourceId: id,
      userId: req.user.id,
    });

    return res
      .status(200)
      .json({ message: "TriggerLog retrieved", triggerLog });
  } catch (error) {
    logger.error("TriggerLog retrieval failed", {
      context: "triggerLog",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to retrieve triggerLog" });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const triggerLog = await TriggerLog.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!triggerLog) {
      logger.warn("TriggerLog not found for update", {
        context: "triggerLog",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "TriggerLog not found" });
    }

    logger.info("TriggerLog updated", {
      context: "triggerLog",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "TriggerLog updated", triggerLog });
  } catch (error) {
    logger.error("TriggerLog update failed", {
      context: "triggerLog",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "TriggerLog name already exists" });
    }

    return res.status(500).json({ message: "Failed to update triggerLog" });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const triggerLog = await TriggerLog.findByIdAndDelete(id);

    if (!triggerLog) {
      logger.warn("TriggerLog not found for deletion", {
        context: "triggerLog",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "TriggerLog not found" });
    }

    logger.info("TriggerLog deleted", {
      context: "triggerLog",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(204).json();
  } catch (error) {
    logger.error("TriggerLog deletion failed", {
      context: "triggerLog",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to delete triggerLog" });
  }
};
