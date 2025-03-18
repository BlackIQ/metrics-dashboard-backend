import JWT from "jsonwebtoken";

import { User, Role } from "$app/models/index.js";
import { appConfig } from "$app/config/index.js";

import { redis as Redis } from "$app/connections/index.js";

import logger from "$app/log/index.js";

export const jwt = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid Authorization header" });
  }

  try {
    const isBlacklisted = await Redis.get(`blacklist:${token}`);

    if (isBlacklisted) {
      logger.warn("Token blacklisted", {
        context: "auth",
        token: token.slice(0, 10) + "...",
      });

      return res.status(401).json({ message: "Token has been logged out" });
    }

    const { id } = JWT.verify(token, appConfig.secret);
    const user = await User.findById(id)
      .select("_id role")
      .populate({ path: "role", select: "value", model: Role });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = { id: user._id.toString(), role: user.role?.value };
    req.headers.uid = id;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    req.user = null;

    return next();
  }
  try {
    const decoded = JWT.verify(token, appConfig.secret);

    req.user = { id: decoded.id };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
