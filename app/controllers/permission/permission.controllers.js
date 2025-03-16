import { Permission } from "$app/models/index.js";

export const CREATE = async (req, res) => {
  const data = req.body;

  try {
    const permission = await Permission.create(data);

    return res.status(200).json({ message: "Permission created", permission });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const permission = await Permission.findOne({ _id: id });

    if (!permission) {
      return res.status(404).json({ message: "Permission did not found" });
    }

    return res.status(200).json({ message: "Permission found", permission });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const ALL = async (req, res) => {
  try {
    const permissions = await Permission.find();

    return res.status(200).json({ message: "Data fetched", permissions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const permission = await Permission.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!permission) {
      return res.status(404).json({ message: "Permission did not found" });
    }

    return res.status(200).json({ message: "Permission updated", permission });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const permission = await Permission.findOneAndDelete({ _id: id });

    if (!permission) {
      return res.status(404).json({ message: "Permission did not found" });
    }

    return res.status(200).json({ message: "Permission deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
