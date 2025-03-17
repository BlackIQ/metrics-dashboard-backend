import { mongo } from "$app/connections/index.js";

import mongoose from "mongoose";
const mongooseSchema = mongoose.Schema;

export const schemaModel = {
  type: {
    type: String,
    default: null,
    enum: ["telegram", "email"],
    required: true,
  },
  config: {
    type: new mongooseSchema({
      chatID: {
        type: String,
        required: function () {
          return this.type === "telegram";
        },
      },
      botToken: {
        type: String,
        required: function () {
          return this.type === "telegram";
        },
      },
      destinationEmail: {
        type: String,
        required: function () {
          return this.type === "email";
        },
      },
    }),
    default: {},
  },
  user: {
    type: mongooseSchema.Types.ObjectId,
    ref: "User",
    default: null,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true,
  },
};

export const schema = new mongooseSchema(schemaModel, { timestamps: true });

schema.index({ user: 1 });

export default mongo.model("Alert", schema);
