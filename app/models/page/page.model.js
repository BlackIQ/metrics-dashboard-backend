import { mongo } from "$app/connections/index.js";

import mongoose from "mongoose";
const mongooseSchema = mongoose.Schema;

export const pageSchemaModel = {
  title: {
    type: String,
    required: true,
  },
  user: {
    type: mongooseSchema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
};

export const pageSchema = new mongooseSchema(pageSchemaModel, {
  timestamps: true,
});

pageSchema.index({ user: 1 });

export default mongo.model("Page", pageSchema);
