import { mongo } from "$app/connections/index.js";

import mongoose from "mongoose";
const mongooseSchema = mongoose.Schema;

export const schemaModel = {
  resolution: {
    type: String,
    enum: ["problem", "resolved", "incident", "warning"],
    default: "problem",
  },
  query: {
    type: Object,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
};

export const schema = new mongooseSchema(schemaModel, { timestamps: true });

export default mongo.model("Trigger", schema);
