// Models
import { Permission } from "$app/models/index.js";

// Logger
import logger from "$app/log/index.js";

export const ALL = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const permissions = await Permission.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Permission.countDocuments();

    logger.info("Permissions fetched", {
      context: "permission",
      userId: req.user.id,
      page,
      limit,
      total,
    });

    return res.status(200).json({
      message: "Permissions fetched",
      permissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Permissions fetch failed", {
      context: "permission",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to fetch permissions" });
  }
};

export const CREATE = async (req, res) => {
  const data = req.body;

  try {
    const permission = await Permission.create(data);

    logger.info("Permission created", {
      context: "permission",
      resourceType: "permission",
      resourceId: permission._id.toString(),
      userId: req.user.id,
    });

    return res.status(201).json({ message: "Permission created", permission });
  } catch (error) {
    logger.error("Permission creation failed", {
      context: "permission",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Permission name already exists" });
    }

    return res.status(500).json({ message: "Failed to create permission" });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const permission = await Permission.findById(id).lean();

    if (!permission) {
      logger.warn("Permission not found", {
        context: "permission",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Permission not found" });
    }

    logger.info("Permission retrieved", {
      context: "permission",
      resourceId: id,
      userId: req.user.id,
    });

    return res
      .status(200)
      .json({ message: "Permission retrieved", permission });
  } catch (error) {
    logger.error("Permission retrieval failed", {
      context: "permission",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to retrieve permission" });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const permission = await Permission.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!permission) {
      logger.warn("Permission not found for update", {
        context: "permission",
        resourceId: id,
        userId: req.user.id,
      });
      
      return res.status(404).json({ message: "Permission not found" });
    }

    logger.info("Permission updated", {
      context: "permission",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Permission updated", permission });
  } catch (error) {
    logger.error("Permission update failed", {
      context: "permission",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Permission name already exists" });
    }

    return res.status(500).json({ message: "Failed to update permission" });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const permission = await Permission.findByIdAndDelete(id);

    if (!permission) {
      logger.warn("Permission not found for deletion", {
        context: "permission",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Permission not found" });
    }

    logger.info("Permission deleted", {
      context: "permission",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(204).json();
  } catch (error) {
    logger.error("Permission deletion failed", {
      context: "permission",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to delete permission" });
  }
};
