// Models
import { User, Role, Permission } from "$app/models/index.js";

// Logger
import logger from "$app/log/index.js";

// Libs
import md5 from "md5";

export const ALL = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const users = await User.find()
      .populate({
        path: "role",
        model: Role,
        populate: {
          path: "permissions",
          model: Permission,
          select: "label value",
        },
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await User.countDocuments();

    logger.info("Users fetched", {
      context: "user",
      userId: req.user.id,
      page,
      limit,
      total,
    });

    return res.status(200).json({
      message: "Users fetched",
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Users fetch failed", {
      context: "user",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id)
      .populate({
        path: "role",
        model: Role,
        populate: {
          path: "permissions",
          model: Permission,
          select: "label value",
        },
      })
      .lean();

    if (!user) {
      logger.warn("User not found", {
        context: "user",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "User not found" });
    }

    logger.info("User retrieved", {
      context: "user",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "User retrieved", user });
  } catch (error) {
    logger.error("User retrieval failed", {
      context: "user",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to retrieve user" });
  }
};

export const ME = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await User.findById(id)
      .populate({
        path: "role",
        model: Role,
        populate: {
          path: "permissions",
          model: Permission,
          select: "label value",
        },
      })
      .lean();

    if (!user) {
      logger.warn("Me not found", {
        context: "user",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Me not found" });
    }

    logger.info("Me retrieved", {
      context: "user",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Me retrieved", user });
  } catch (error) {
    logger.error("Me retrieval failed", {
      context: "user",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to retrieve me" });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!user) {
      logger.warn("User not found for update", {
        context: "user",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "User not found" });
    }

    logger.info("User updated", {
      context: "user",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "User updated", user });
  } catch (error) {
    logger.error("User update failed", {
      context: "user",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }

    return res.status(500).json({ message: "Failed to update user" });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      logger.warn("User not found for deletion", {
        context: "user",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "User not found" });
    }

    logger.info("User deleted", {
      context: "user",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(204).json();
  } catch (error) {
    logger.error("User deletion failed", {
      context: "user",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to delete user" });
  }
};

export const CHANGE_PASSWORD = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const hashedPassword = md5(password);

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!user) {
      logger.warn("User not found for password change", {
        context: "user",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "User not found" });
    }

    logger.info("User password changed", {
      context: "user",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "User password changed", user });
  } catch (error) {
    logger.error("Password change failed", {
      context: "user",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to change password" });
  }
};
