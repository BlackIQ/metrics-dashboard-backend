import { Group } from "$app/models/index.js";
import { ray } from "$app/functions/index.js";

export const CREATE = async (req, res) => {
  const data = req.body;
  const { uid: user } = req.headers;

  const value = ray.gen(20);

  try {
    const group = await Group.create({ ...data, user, value });

    return res.status(200).json({ message: "Group created", group });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await Group.findOne({ _id: id });

    if (!group) {
      return res.status(404).json({ message: "Group did not found" });
    }

    return res.status(200).json({ message: "Group found", group });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const ALL = async (req, res) => {
  const filter = req.query;

  try {
    const groups = await Group.find(filter).populate("user");

    return res.status(200).json({ message: "Data fetched", groups });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const group = await Group.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ message: "Group did not found" });
    }

    return res.status(200).json({ message: "Group updated", group });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await Group.findOneAndDelete({ _id: id });

    if (!group) {
      return res.status(404).json({ message: "Group did not found" });
    }

    return res.status(200).json({ message: "Group deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
