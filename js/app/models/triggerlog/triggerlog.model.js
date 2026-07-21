import { mongo } from "$app/connections/index.js";

import mongoose from "mongoose";
const mongooseSchema = mongoose.Schema;

export const schemaModel = {
  trigger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trigger",
    required: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Host",
    required: true,
  },
  metrics: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
};

export const schema = new mongooseSchema(schemaModel, { timestamps: true });

export default mongo.model("TriggerLog", schema);
