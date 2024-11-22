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
  accessToken: {
    type: String,
    default: "",
  },
  user: {
    type: mongooseSchema.Types.ObjectId,
    ref: "User",
    default: null,
  },
};

export const schema = new mongooseSchema(schemaModel, { timestamps: true });

export default mongo.model("Host", schema);
