import { User, Role } from "$app/models/index.js";

import logger from "$app/log/index.js";

import { generateAuthToken } from "$app/utils/index.js";

import admin from "$app/firebase/index.js";

export const GOOGLE_LOGIN = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    logger.warn("Google login failed - no ID token provided", {
      context: "oauth",
    });

    return res.status(400).json({ message: "ID token is required" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const { email, uid, name } = decodedToken;

    let user = await User.findOne({
      $or: [{ oauthId: uid, oauthProvider: "google" }, { email }],
    });

    if (!user) {
      const userRole = await Role.findOne({ value: "user" });

      if (!userRole) {
        logger.error("Default user role not found", { context: "oauth" });

        return res.status(500).json({ message: "Server configuration error" });
      }

      const [firstName, ...lastNameArr] = (name || "").split(" ");
      const lastName = lastNameArr.join(" ");

      user = await User.create({
        email,
        firstName: firstName || "",
        lastName: lastName || "",
        isConfirmed: true,
        role: userRole._id,
        oauthProvider: "google",
        oauthId: uid,
      });

      logger.info("New Google user created", {
        context: "oauth",
        userId: user._id.toString(),
        email,
      });
    } else if (!user.oauthProvider) {
      user = await User.findByIdAndUpdate(
        user._id,
        { oauthProvider: "google", oauthId: uid },
        { new: true }
      );

      logger.info("Google account linked to existing user", {
        context: "oauth",
        userId: user._id.toString(),
        email,
      });
    }

    const token = generateAuthToken({ id: user._id });

    logger.info("Google user logged in", {
      context: "oauth",
      userId: user._id.toString(),
      email,
    });

    return res.status(200).json({
      message: "Welcome",
      token,
      user: user.toObject(),
    });
  } catch (error) {
    logger.error("Google login failed", {
      context: "oauth",
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({ message: "Failed to login with Google" });
  }
};

export const GITHUB_LOGIN = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    logger.warn("GitHub login failed - no ID token provided", {
      context: "oauth",
    });

    return res.status(400).json({ message: "ID token is required" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const { email, uid, name } = decodedToken;

    let user = await User.findOne({
      $or: [{ oauthId: uid, oauthProvider: "github" }, { email }],
    });

    if (!user) {
      const userRole = await Role.findOne({ value: "user" });

      if (!userRole) {
        logger.error("Default user role not found", { context: "oauth" });

        return res.status(500).json({ message: "Server configuration error" });
      }

      const [firstName, ...lastNameArr] = (name || "").split(" ");
      const lastName = lastNameArr.join(" ");

      user = await User.create({
        email,
        firstName: firstName || "",
        lastName: lastName || "",
        isConfirmed: true,
        role: userRole._id,
        oauthProvider: "github",
        oauthId: uid,
      });

      logger.info("New GitHub user created", {
        context: "oauth",
        userId: user._id.toString(),
        email,
      });
    } else if (!user.oauthProvider) {
      user = await User.findByIdAndUpdate(
        user._id,
        { oauthProvider: "github", oauthId: uid },
        { new: true }
      );

      logger.info("GitHub account linked to existing user", {
        context: "oauth",
        userId: user._id.toString(),
        email,
      });
    }

    const token = generateAuthToken({ id: user._id });

    logger.info("GitHub user logged in", {
      context: "oauth",
      userId: user._id.toString(),
      email,
    });

    return res.status(200).json({
      message: "Welcome",
      token,
      user: user.toObject(),
    });
  } catch (error) {
    logger.error("GitHub login failed", {
      context: "oauth",
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({ message: "Failed to login with GitHub" });
  }
};

export const FACEBOOK_LOGIN = async (req, res) => {
  return res
    .status(501)
    .json({ message: "Facebook login not implemented yet" });
};

export const MICROSOFT_LOGIN = async (req, res) => {
  return res
    .status(501)
    .json({ message: "Microsoft login not implemented yet" });
};
