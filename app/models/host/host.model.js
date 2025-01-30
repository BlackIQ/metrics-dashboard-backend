import { mongo } from "$app/connections/index.js";

import mongoose from "mongoose";
const mongooseSchema = mongoose.Schema;

export const schemaModel = {
  name: {
    type: String,
    default: "",
  },
  details: {
    type: String,
    default: "",
  },
  ip: {
    type: String,
    default: "",
  },
  dns: {
    type: String,
    default: "",
  },
  port: {
    type: String,
    default: "",
  },
  ipCommunication: {
    type: Boolean,
    default: true,
  },
  agentAvailable: {
    type: Boolean,
    default: null,
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
    default: null,
  },
  groups: [
    {
      type: mongooseSchema.Types.ObjectId,
      ref: "Group",
      default: [],
    },
  ],
  tags: [
    {
      type: mongooseSchema.Types.ObjectId,
      ref: "Tag",
      default: [],
    },
  ],
};

export const schema = new mongooseSchema(schemaModel, { timestamps: true });

export default mongo.model("Host", schema);
