import { Group } from "$app/models/index.js";
import logger from "$app/log/index.js";
import crypto from "crypto";

const generateSecureValue = () => crypto.randomBytes(10).toString("hex");

export const ALL = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const user = req.user.id;

    const groups = await Group.find({ user })
      .populate("user", "email firstName")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Group.countDocuments({ user });

    logger.info("Groups fetched", {
      context: "group",
      userId: user,
      page,
      limit,
      total,
    });
    
    return res.status(200).json({
      message: "Groups fetched",
      groups,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Groups fetch failed", {
      context: "group",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to fetch groups" });
  }
};

export const CREATE = async (req, res) => {
  const data = req.body;
  const user = req.user.id;

  const value = generateSecureValue();

  try {
    const group = await Group.create({ ...data, user, value });
    
    logger.info("Group created", {
      context: "group",
      resourceType: "group",
      resourceId: group._id.toString(),
      userId: user,
    });

    return res.status(201).json({ message: "Group created", group });
  } catch (error) {
    logger.error("Group creation failed", {
      context: "group",
      error: error.message,
      stack: error.stack,
      userId: user,
    });

    if (error.code === 11000) {
      return res.status(409).json({ message: "Group value already exists" });
    }

    return res.status(500).json({ message: "Failed to create group" });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await Group.findById(id)
      .populate("user", "email firstName")
      .lean();

    if (!group) {
      logger.warn("Group not found", {
        context: "group",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Group not found" });
    }

    logger.info("Group retrieved", {
      context: "group",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Group retrieved", group });
  } catch (error) {
    logger.error("Group retrieval failed", {
      context: "group",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to retrieve group" });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const group = await Group.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!group) {
      logger.warn("Group not found for update", {
        context: "group",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Group not found" });
    }

    logger.info("Group updated", {
      context: "group",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Group updated", group });
  } catch (error) {
    logger.error("Group update failed", {
      context: "group",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    if (error.code === 11000) {
      return res.status(409).json({ message: "Group value already exists" });
    }

    return res.status(500).json({ message: "Failed to update group" });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await Group.findByIdAndDelete(id);

    if (!group) {
      logger.warn("Group not found for deletion", {
        context: "group",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Group not found" });
    }

    logger.info("Group deleted", {
      context: "group",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(204).json();
  } catch (error) {
    logger.error("Group deletion failed", {
      context: "group",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to delete group" });
  }
};
