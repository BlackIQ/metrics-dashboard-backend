// ----------------------------------------------
// $app/middlewares/agent
// agent.middleware.js
// ----------------------------------------------
// Agent Access Middleware.
// Check the server ID with access token

import { Server } from "$app/models/index.js";

const agentAccess = async (req, res, next) => {
  // ----------------------------------------------
  // agentAccess()
  // ----------------------------------------------
  // Check headers
  // Find server
  // Compair data

  const { accesstoken, serverid } = req.headers;

  if (!accesstoken) {
    return res.status(401).send({ message: "Not valid access token" });
  }

  if (!serverid) {
    return res.status(401).send({ message: "Not valid server id" });
  }

  try {
    const server = await Server.findOne({ _id: serverid });

    if (!server) {
      return res.status(401).send({ message: "Server is not valid" });
    }

    if (accesstoken !== server.accessToken) {
      return res.status(401).send({ message: "Wrong Token" });
    }

    req.headers.server = server;

    next();
  } catch (error) {
    return res.status(401).send({ message: error.message });
  }
};

export default agentAccess;
