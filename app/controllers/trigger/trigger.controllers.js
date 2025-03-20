// Models
import { Trigger } from "$app/models/index.js";

// Logger
import logger from "$app/log/index.js";

export const ALL = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const triggers = await Trigger.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Trigger.countDocuments();

    logger.info("Triggers fetched", {
      context: "trigger",
      userId: req.user.id,
      page,
      limit,
      total,
    });

    return res.status(200).json({
      message: "Triggers fetched",
      triggers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Triggers fetch failed", {
      context: "trigger",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to fetch triggers" });
  }
};

export const CREATE = async (req, res) => {
  // const data = req.body;

  try {
    // const trigger = await Trigger.create(data);

    // logger.info("Trigger created", {
    //   context: "trigger",
    //   resourceType: "trigger",
    //   resourceId: trigger._id.toString(),
    //   userId: req.user.id,
    // });

    // return res.status(201).json({ message: "Trigger created", trigger });

    const defaultTriggers = [
      {
        resolution: "problem",
        query: { "cpu.total_usage": { $gte: 20 } },
        message: "CPU usage is more than 20%",
      },
      {
        resolution: "resolved",
        query: { "cpu.total_usage": { $lt: 20 } },
        message: "CPU usage back below 20%",
      },
    ];

    await Trigger.deleteMany({});
    await Trigger.insertMany(defaultTriggers);

    return res.status(201).json({ message: "Default triggers seeded" });
  } catch (error) {
    logger.error("Trigger creation failed", {
      context: "trigger",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    if (error.code === 11000) {
      return res.status(409).json({ message: "Trigger name already exists" });
    }

    return res.status(500).json({ message: "Failed to create trigger" });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const trigger = await Trigger.findById(id).lean();

    if (!trigger) {
      logger.warn("Trigger not found", {
        context: "trigger",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Trigger not found" });
    }

    logger.info("Trigger retrieved", {
      context: "trigger",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Trigger retrieved", trigger });
  } catch (error) {
    logger.error("Trigger retrieval failed", {
      context: "trigger",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to retrieve trigger" });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const trigger = await Trigger.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!trigger) {
      logger.warn("Trigger not found for update", {
        context: "trigger",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Trigger not found" });
    }

    logger.info("Trigger updated", {
      context: "trigger",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Trigger updated", trigger });
  } catch (error) {
    logger.error("Trigger update failed", {
      context: "trigger",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    if (error.code === 11000) {
      return res.status(409).json({ message: "Trigger name already exists" });
    }

    return res.status(500).json({ message: "Failed to update trigger" });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const trigger = await Trigger.findByIdAndDelete(id);

    if (!trigger) {
      logger.warn("Trigger not found for deletion", {
        context: "trigger",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Trigger not found" });
    }

    logger.info("Trigger deleted", {
      context: "trigger",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(204).json();
  } catch (error) {
    logger.error("Trigger deletion failed", {
      context: "trigger",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to delete trigger" });
  }
};
