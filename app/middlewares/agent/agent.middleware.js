// ----------------------------------------------
// $app/middlewares/agent
// agent.middleware.js
// ----------------------------------------------
// Agent Access Middleware.
// Check the Host ID with access token

import { Host } from "$app/models/index.js";

const agentAccess = async (req, res, next) => {
  // ----------------------------------------------
  // agentAccess()
  // ----------------------------------------------
  // Check headers
  // Find host
  // Compair data

  const { accesstoken, hostid } = req.headers;

  if (!accesstoken) {
    return res.status(401).json({ message: "Not valid access token" });
  }

  if (!hostid) {
    return res.status(401).json({ message: "Not valid host id" });
  }

  try {
    const host = await Host.findOne({ _id: hostid });

    if (!host) {
      return res.status(401).json({ message: "Host is not valid" });
    }

    if (accesstoken !== host.accessToken) {
      return res.status(401).json({ message: "Wrong Token" });
    }

    req.headers.host = host;

    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

export default agentAccess;
