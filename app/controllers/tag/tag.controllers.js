// Models
import { Tag } from "$app/models/index.js";

// Logger
import logger from "$app/log/index.js";

// Utils
import { generateSecureValue } from "$app/utils/index.js";

export const ALL = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const user = req.user.id;

    const tags = await Tag.find({ user })
      .populate("user", "email firstName")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Tag.countDocuments({ user });

    logger.info("Tags fetched", {
      context: "tag",
      userId: user,
      page,
      limit,
      total,
    });

    return res.status(200).json({
      message: "Tags fetched",
      tags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Tags fetch failed", {
      context: "tag",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to fetch tags" });
  }
};

export const CREATE = async (req, res) => {
  const data = req.body;
  const user = req.user.id;

  const value = generateSecureValue();

  try {
    const tag = await Tag.create({ ...data, user, value });

    logger.info("Tag created", {
      context: "tag",
      resourceType: "tag",
      resourceId: tag._id.toString(),
      userId: user,
    });

    return res.status(201).json({ message: "Tag created", tag });
  } catch (error) {
    logger.error("Tag creation failed", {
      context: "tag",
      error: error.message,
      stack: error.stack,
      userId: user,
    });

    if (error.code === 11000) {
      return res.status(409).json({ message: "Tag value already exists" });
    }

    return res.status(500).json({ message: "Failed to create tag" });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const tag = await Tag.findById(id)
      .populate("user", "email firstName")
      .lean();

    if (!tag) {
      logger.warn("Tag not found", {
        context: "tag",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Tag not found" });
    }

    logger.info("Tag retrieved", {
      context: "tag",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Tag retrieved", tag });
  } catch (error) {
    logger.error("Tag retrieval failed", {
      context: "tag",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to retrieve tag" });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const tag = await Tag.findByIdAndUpdate(id, { $set: data }, { new: true });

    if (!tag) {
      logger.warn("Tag not found for update", {
        context: "tag",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Tag not found" });
    }

    logger.info("Tag updated", {
      context: "tag",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Tag updated", tag });
  } catch (error) {
    logger.error("Tag update failed", {
      context: "tag",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    if (error.code === 11000) {
      return res.status(409).json({ message: "Tag value already exists" });
    }

    return res.status(500).json({ message: "Failed to update tag" });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const tag = await Tag.findByIdAndDelete(id);

    if (!tag) {
      logger.warn("Tag not found for deletion", {
        context: "tag",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Tag not found" });
    }

    logger.info("Tag deleted", {
      context: "tag",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(204).json();
  } catch (error) {
    logger.error("Tag deletion failed", {
      context: "tag",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to delete tag" });
  }
};
