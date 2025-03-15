import { mongo } from "$app/connections/index.js";

import mongoose from "mongoose";
const mongooseSchema = mongoose.Schema;

export const schemaModel = {
  type: {
    type: String,
    default: null,
    enum: ["telegram", "email"],
  },
  config: {
    type: Object,
    default: {},
  },
  user: {
    type: mongooseSchema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
};

export const schema = new mongooseSchema(schemaModel, { timestamps: true });

export default mongo.model("Alert", schema);
