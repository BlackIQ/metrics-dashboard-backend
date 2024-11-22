import { Tag } from "$app/models/index.js";

export const CREATE = async (req, res) => {
  const data = req.body;
  const { uid: user } = req.headers;

  try {
    const tag = await Tag.create({ ...data, user });

    return res.status(200).send({ message: "Tag created", tag });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const tag = await Tag.findOne({ _id: id });

    if (!tag) {
      return res.status(404).send({ message: "Tag did not found" });
    }

    return res.status(200).send({ message: "Tag found", tag });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const ALL = async (req, res) => {
  try {
    const tags = await Tag.find();

    return res.status(200).send({ message: "Data fetched", tags });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const tag = await Tag.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!tag) {
      return res.status(404).send({ message: "Tag did not found" });
    }

    return res.status(200).send({ message: "Tag updated", tag });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const tag = await Tag.findOneAndDelete({ _id: id });

    if (!tag) {
      return res.status(404).send({ message: "Tag did not found" });
    }

    return res.status(200).send({ message: "Tag deleted" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
