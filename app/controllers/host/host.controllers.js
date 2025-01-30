import { Host } from "$app/models/index.js";

import axios from "axios";

export const CREATE = async (req, res) => {
  const data = req.body;
  const { uid: user } = req.headers;

  try {
    const host = await Host.create({ ...data, user });

    return res.status(200).send({ message: "Host created", host });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const host = await Host.findOne({ _id: id });

    if (!host) {
      return res.status(404).send({ message: "Host did not found" });
    }

    return res.status(200).send({ message: "Host found", host });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const ALL = async (req, res) => {
  const filter = req.query;

  try {
    const hosts = await Host.find(filter)
      .populate("user")
      .populate("groups")
      .populate("tags");

    return res.status(200).send({ message: "Data fetched", hosts });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const host = await Host.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!host) {
      return res.status(404).send({ message: "Host did not found" });
    }

    return res.status(200).send({ message: "Host updated", host });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const host = await Host.findOneAndDelete({ _id: id });

    if (!host) {
      return res.status(404).send({ message: "Host did not found" });
    }

    return res.status(200).send({ message: "Host deleted" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const CHECK = async (req, res) => {
  const { host } = req.body;

  try {
    const hostBaseUrl = `http://${host.ipCommunication ? host.ip : host.dns}:${
      host.port
    }`;

    const { data: ping } = await axios.get(`${hostBaseUrl}/api/ping`, {
      timeout: 5000,
    });

    if (ping.message !== "pong") {
      throw new Error("Ping response invalid");
    }

    return res.status(200).send({ message: "Server is ok!" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
