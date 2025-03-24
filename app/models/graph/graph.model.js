import { mongo } from "$app/connections/index.js";

import mongoose from "mongoose";
const mongooseSchema = mongoose.Schema;

export const graphSchemaModel = {
  page: {
    type: mongooseSchema.Types.ObjectId,
    ref: "Page",
    required: true,
  },
  user: {
    type: mongooseSchema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  host: {
    type: mongooseSchema.Types.ObjectId,
    ref: "Host",
    required: true,
  },
  measurement: {
    type: String,
    required: true,
  },
  fields: {
    type: [String],
    required: true,
  },
  title: {
    type: String,
    required: false,
  },
  chart: {
    type: String,
    enum: ["AreaChart", "LineChart"],
    required: true,
  },
  unit: {
    type: String,
    required: false,
  },
  colors: {
    type: Map,
    of: String,
    required: false,
  },
};

export const graphSchema = new mongooseSchema(graphSchemaModel, {
  timestamps: true,
});

graphSchema.index({ page: 1 });
graphSchema.index({ user: 1 });
graphSchema.index({ host: 1 });

export default mongo.model("Graph", graphSchema);
