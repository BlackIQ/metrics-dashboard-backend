// ----------------------------------------------
// $app/middlewares
// index.js
// ----------------------------------------------
// Exporting all API middlewares.
// Like configs, create them in directories and export them here.

import jwt from "$app/middlewares/jwt/jwt.middleware.js";
import key from "$app/middlewares/key/key.middleware.js";
import agent from "$app/middlewares/agent/agent.middleware.js";

export { key, jwt, agent };
