// ----------------------------------------------
// $app/middlewares
// index.js
// ----------------------------------------------
// Exporting all API middlewares.
// Like configs, create them in directories and export them here.

import jwt from "$app/middlewares/jwt/jwt.middleware.js";
import key from "$app/middlewares/key/key.middleware.js";
import ratelimit from "$app/middlewares/ratelimit/ratelimit.middleware.js";
import validate from "$app/middlewares/validate/validate.middleware.js";
import superuser from "$app/middlewares/superuser/superuser.middleware.js";
import {
  resourceOwnership,
  userOwnership,
} from "$app/middlewares/ownership/ownership.middleware.js";

export {
  key,
  jwt,
  resourceOwnership,
  userOwnership,
  superuser,
  validate,
  ratelimit,
};
