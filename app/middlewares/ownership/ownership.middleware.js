import * as Models from "$app/models/index.js";

const resourceOwnership = (modelName) => async (req, res, next) => {
  const Model = Models[modelName];

  const { id } = req.params;
  const userId = req.user.id;

  try {
    const resource = await Model.findById(id);
    if (!resource) {
      return res.status(404).json({ message: `${modelName} not found` });
    }

    if (req.user.role !== "superuser" && resource.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You don’t own this resource" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const userOwnership = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    if (role === "superuser") {
      return next();
    }

    if (id && id !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only manage your own data" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { resourceOwnership, userOwnership };
