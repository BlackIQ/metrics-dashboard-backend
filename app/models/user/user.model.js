import { mongo } from "$app/connections/index.js";

import mongoose from "mongoose";
const mongooseSchema = mongoose.Schema;

export const schemaModel = {
  firstName: {
    type: String,
    default: "",
  },
  lastName: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  role: {
    type: mongooseSchema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
};

export const schema = new mongooseSchema(schemaModel, { timestamps: true });

schema.index({ email: 1 }, { unique: true });

export default mongo.model("User", schema);
