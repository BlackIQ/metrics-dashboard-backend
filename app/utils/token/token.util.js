import { appConfig } from "$app/config/index.js";

import jwt from "jsonwebtoken";

export const generateAuthToken = (payload, remember = false) => {
  if (!payload || !appConfig.secret) {
    throw new Error("Invalid payload or secret for token generation");
  }

  return jwt.sign(payload, appConfig.secret, {
    expiresIn: remember ? "30d" : "1h", // 30 days if "remember me", else 1 hour
  });
};
