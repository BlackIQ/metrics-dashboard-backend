// ----------------------------------------------
// $app/connections/mongo
// mongo.connections.js
// ----------------------------------------------
// MongoDB connection.
// Here we export the instance of MongoDB.

import mongoose from "mongoose";

import { databaseConfig } from "$app/config/index.js";

const { logMongo: mongoCongig } = databaseConfig;

const url = mongoCongig.connection;

const connection = mongoose.createConnection(url, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Connected to log mongodb.");
  }
});

export default connection;
