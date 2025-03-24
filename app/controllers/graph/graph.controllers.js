// Models
import { Graph } from "$app/models/index.js";

// Logger
import logger from "$app/log/index.js";

// Utils
import { generateSecureValue } from "$app/utils/index.js";

export const ALL = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const user = req.user.id;

    const graphs = await Graph.find({ user })
      .populate("user", "email firstName")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Graph.countDocuments({ user });

    logger.info("Graphs fetched", {
      context: "graph",
      userId: user,
      page,
      limit,
      total,
    });

    return res.status(200).json({
      message: "Graphs fetched",
      graphs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Graphs fetch failed", {
      context: "graph",
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to fetch graphs" });
  }
};

export const CREATE = async (req, res) => {
  const data = req.body;
  const user = req.user.id;

  const value = generateSecureValue();

  try {
    const graph = await Graph.create({ ...data, user, value });

    logger.info("Graph created", {
      context: "graph",
      resourceType: "graph",
      resourceId: graph._id.toString(),
      userId: user,
    });

    return res.status(201).json({ message: "Graph created", graph });
  } catch (error) {
    logger.error("Graph creation failed", {
      context: "graph",
      error: error.message,
      stack: error.stack,
      userId: user,
    });

    if (error.code === 11000) {
      return res.status(409).json({ message: "Graph value already exists" });
    }

    return res.status(500).json({ message: "Failed to create graph" });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const graph = await Graph.findById(id)
      .populate("user", "email firstName")
      .lean();

    if (!graph) {
      logger.warn("Graph not found", {
        context: "graph",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Graph not found" });
    }

    logger.info("Graph retrieved", {
      context: "graph",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Graph retrieved", graph });
  } catch (error) {
    logger.error("Graph retrieval failed", {
      context: "graph",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to retrieve graph" });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const graph = await Graph.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!graph) {
      logger.warn("Graph not found for update", {
        context: "graph",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Graph not found" });
    }

    logger.info("Graph updated", {
      context: "graph",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: "Graph updated", graph });
  } catch (error) {
    logger.error("Graph update failed", {
      context: "graph",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    if (error.code === 11000) {
      return res.status(409).json({ message: "Graph value already exists" });
    }

    return res.status(500).json({ message: "Failed to update graph" });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const graph = await Graph.findByIdAndDelete(id);

    if (!graph) {
      logger.warn("Graph not found for deletion", {
        context: "graph",
        resourceId: id,
        userId: req.user.id,
      });

      return res.status(404).json({ message: "Graph not found" });
    }

    logger.info("Graph deleted", {
      context: "graph",
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(204).json();
  } catch (error) {
    logger.error("Graph deletion failed", {
      context: "graph",
      error: error.message,
      stack: error.stack,
      resourceId: id,
      userId: req.user.id,
    });

    return res.status(500).json({ message: "Failed to delete graph" });
  }
};
