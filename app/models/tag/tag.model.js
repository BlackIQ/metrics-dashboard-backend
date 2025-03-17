import { mongo } from "$app/connections/index.js";

import mongoose from "mongoose";
const mongooseSchema = mongoose.Schema;

export const schemaModel = {
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongooseSchema.Types.ObjectId,
    ref: "User",
    required: true,
  },
};

export const schema = new mongooseSchema(schemaModel, { timestamps: true });

schema.index({ user: 1 });
schema.index({ value: 1 }, { unique: true });

export default mongo.model("Tag", schema);
