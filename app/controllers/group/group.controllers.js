import { Group } from "$app/models/index.js";

export const CREATE = async (req, res) => {
  const data = req.body;
  const { uid: user } = req.headers;

  try {
    const group = await Group.create({ ...data, user });

    return res.status(200).send({ message: "Group created", group });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await Group.findOne({ _id: id });

    if (!group) {
      return res.status(404).send({ message: "Group did not found" });
    }

    return res.status(200).send({ message: "Group found", group });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const ALL = async (req, res) => {
  try {
    const groups = await Group.find();

    return res.status(200).send({ message: "Data fetched", groups });
  } catch (error) {
    return res.status(500).send({ message: error.message });
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
      return res.status(404).send({ message: "Group did not found" });
    }

    return res.status(200).send({ message: "Group updated", group });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await Group.findOneAndDelete({ _id: id });

    if (!group) {
      return res.status(404).send({ message: "Group did not found" });
    }

    return res.status(200).send({ message: "Group deleted" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
