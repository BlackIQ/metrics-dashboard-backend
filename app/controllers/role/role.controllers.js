// Models
import { Role, Permission } from "$app/models/index.js";

// Logger
import logger from "$app/log/index.js";

export const ALL = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const roles = await Role.find()
      .populate({
        path: "permissions",
        model: Permission,
        select: "label value",
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Role.countDocuments();

    logger.info("Roles fetched", {
      context: "role",
      userId: req.user.id,
      page,
      limit,
      total,
    });

    return res.status(200).json({
      message: "Roles fetched",
      roles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Roles fetch failed", {
      context: "role",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to fetch roles" });
  }
};

export const CREATE = async (req, res) => {
  const data = req.body;

  try {
    const role = await Role.create(data);

    logger.info("Role created", {
      context: "role",
      resourceType: "role",
      resourceId: role._id.toString(),
      userId: req.user.id,
    });

    return res.status(201).json({ message: "Role created", role });
  } catch (error) {
    logger.error("Role creation failed", {
      context: "role",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    if (error.code === 11000) {
      return res.status(409).json({ message: "Role value already exists" });
    }

    return res.status(500).json({ message: "Failed to create role" });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await Role.findById(id).populate({
      path: "permissions",
      model: Permission,
      select: "label value",
    });

    if (!role) {
      logger.warn("Role not found", {
        context: "role",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Role not found" });
    }

    logger.info("Role retrieved", {
      context: "role",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Role retrieved", role });
  } catch (error) {
    logger.error("Role retrieval failed", {
      context: "role",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to retrieve role" });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const role = await Role.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!role) {
      logger.warn("Role not found for update", {
        context: "role",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Role not found" });
    }

    logger.info("Role updated", {
      context: "role",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Role updated", role });
  } catch (error) {
    logger.error("Role update failed", {
      context: "role",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    if (error.code === 11000) {
      return res.status(409).json({ message: "Role value already exists" });
    }

    return res.status(500).json({ message: "Failed to update role" });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await Role.findByIdAndDelete(id);

    if (!role) {
      logger.warn("Role not found for deletion", {
        context: "role",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Role not found" });
    }

    logger.info("Role deleted", {
      context: "role",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(204).json();
  } catch (error) {
    logger.error("Role deletion failed", {
      context: "role",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to delete role" });
  }
};
