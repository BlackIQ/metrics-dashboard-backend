// Models
import { Page } from "$app/models/index.js";

// Logger
import logger from "$app/log/index.js";

// Utils
import { generateSecureValue } from "$app/utils/index.js";

export const ALL = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const user = req.user.id;

    const pages = await Page.find({ user })
      .populate("user", "email firstName")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Page.countDocuments({ user });

    logger.info("Pages fetched", {
      context: "page",
      userId: user,
      page,
      limit,
      total,
    });

    return res.status(200).json({
      message: "Pages fetched",
      pages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Pages fetch failed", {
      context: "page",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to fetch pages" });
  }
};

export const CREATE = async (req, res) => {
  const data = req.body;
  const user = req.user.id;

  const value = generateSecureValue();

  try {
    const page = await Page.create({ ...data, user, value });

    logger.info("Page created", {
      context: "page",
      resourceType: "page",
      resourceId: page._id.toString(),
      userId: user,
    });

    return res.status(201).json({ message: "Page created", page });
  } catch (error) {
    logger.error("Page creation failed", {
      context: "page",
      error: error.message,
      stack: error.stack,
      userId: user,
    });

    if (error.code === 11000) {
      return res.status(409).json({ message: "Page value already exists" });
    }

    return res.status(500).json({ message: "Failed to create page" });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const page = await Page.findById(id)
      .populate("user", "email firstName")
      .lean();

    if (!page) {
      logger.warn("Page not found", {
        context: "page",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Page not found" });
    }

    logger.info("Page retrieved", {
      context: "page",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Page retrieved", page });
  } catch (error) {
    logger.error("Page retrieval failed", {
      context: "page",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to retrieve page" });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const page = await Page.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!page) {
      logger.warn("Page not found for update", {
        context: "page",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Page not found" });
    }

    logger.info("Page updated", {
      context: "page",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Page updated", page });
  } catch (error) {
    logger.error("Page update failed", {
      context: "page",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    if (error.code === 11000) {
      return res.status(409).json({ message: "Page value already exists" });
    }

    return res.status(500).json({ message: "Failed to update page" });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const page = await Page.findByIdAndDelete(id);

    if (!page) {
      logger.warn("Page not found for deletion", {
        context: "page",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Page not found" });
    }

    logger.info("Page deleted", {
      context: "page",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(204).json();
  } catch (error) {
    logger.error("Page deletion failed", {
      context: "page",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to delete page" });
  }
};
