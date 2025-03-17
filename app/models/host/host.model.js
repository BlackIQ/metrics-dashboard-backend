import { mongo } from "$app/connections/index.js";

import mongoose from "mongoose";
const mongooseSchema = mongoose.Schema;

export const schemaModel = {
  name: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    default: "",
  },
  ip: {
    type: String,
    match: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/,
    default: "",
  },
  dns: {
    type: String,
    match: /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    default: "",
  },
  port: {
    type: String,
    match: /^\d{1,5}$/,
    default: "80",
  },
  apiKey: {
    type: String,
    required: true,
  },
  ipCommunication: {
    type: Boolean,
    default: true,
  },
  agentAvailable: {
    type: Boolean,
    default: false,
  },
  dockerMetrics: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  user: {
    type: mongooseSchema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  groups: [
    {
      type: mongooseSchema.Types.ObjectId,
      ref: "Group",
    },
  ],
  tags: [
    {
      type: mongooseSchema.Types.ObjectId,
      ref: "Tag",
    },
  ],
};

export const schema = new mongooseSchema(schemaModel, { timestamps: true });

schema.index({ user: 1 });
schema.index({ ip: 1, port: 1 });

export default mongo.model("Host", schema);
