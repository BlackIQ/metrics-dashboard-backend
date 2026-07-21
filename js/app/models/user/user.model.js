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
    required: false,
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
  oauthProvider: {
    type: String,
    enum: ["google", "facebook", "github", "microsoft", null],
    default: null,
  },
  oauthId: {
    type: String,
    default: null,
  },
};

export const schema = new mongooseSchema(schemaModel, { timestamps: true });

schema.index({ email: 1 }, { unique: true });
schema.index({ oauthProvider: 1, oauthId: 1 });

export default mongo.model("User", schema);
