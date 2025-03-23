// Models
import { User, Role } from "$app/models/index.js";

// Logger
import logger from "$app/log/index.js";

// Config
import { appConfig } from "$app/config/index.js";

// Utils
import {
  sendEmail,
  generateAuthToken,
  generateSecureValue,
} from "$app/utils/index.js";

// Connections
import { redis as Redis } from "$app/connections/index.js";

// Libs
import md5 from "md5";
import jwt from "jsonwebtoken";

export const LOGIN = async (req, res) => {
  const { email, password, remember = false } = req.body;

  try {
    const user = await User.findOne({ email, password: md5(password) }).lean();

    if (!user || !user.isConfirmed) {
      logger.warn("Login failed - invalid credentials or unconfirmed", {
        context: "auth",
        email,
      });

      return res
        .status(401)
        .json({ message: "Invalid credentials or unconfirmed email" });
    }

    const token = generateAuthToken({ id: user._id }, remember);

    logger.info("User logged in", {
      context: "auth",
      userId: user._id.toString(),
    });

    return res.status(200).json({
      message: "Welcome",
      token,
      user,
    });
  } catch (error) {
    logger.error("Login failed", {
      context: "auth",
      error: error.message,
      stack: error.stack,
      email,
    });

    return res.status(500).json({ message: "Failed to login" });
  }
};

export const REGISTER = async (req, res) => {
  const data = req.body;

  try {
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      logger.warn("Registration failed - email exists", {
        context: "auth",
        email: data.email,
      });

      return res.status(409).json({ message: "Email already exists" });
    }

    const userRole = await Role.findOne({ value: "user" });

    if (!userRole) {
      logger.error("Default user role not found", { context: "auth" });

      return res.status(500).json({ message: "Server configuration error" });
    }

    const rayid = generateSecureValue(50);

    const newUser = {
      ...data,
      password: md5(data.password),
      role: data.role || userRole._id,
      isConfirmed: false,
    };

    const user = await User.create(newUser);
    await Redis.setex(`confirm:${rayid}`, 24 * 60 * 60, user._id.toString());

    const confirmEmailContent = `
      <p style="font-size: 18px; color: #00FFFF;">Welcome to OpenHubble Cloud! 🔭</p>
      <p> </p>
      <p>You're one step away from diving into your OpenHubble Cloud panel.</p>
      <p>This link expires in 24 hours—click below to confirm:</p>
      <p style="margin: 20px 0;">
        <a href="https://cloud.openhubble.com/auth/confirm?rayid=${rayid}" 
           style="background-color: #00FFFF; color: #1a1a1a; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600; text-shadow: none;">
          Confirm & Access Panel
        </a>
      </p>
      <p> </p>
      <p>Or paste this: <a href="https://cloud.openhubble.com/auth/confirm?rayid=${rayid}" style="color: #00FFFF; word-break: break-all;">
        https://cloud.openhubble.com/auth/confirm?rayid=${rayid}
      </a></p>
      <p>Ready to explore? 🚀</p>
    `;

    await sendEmail(
      data.email,
      "Confirm Your OpenHubble Cloud Account",
      confirmEmailContent
    );

    logger.info("User registered", {
      context: "auth",
      userId: user._id.toString(),
      email: data.email,
    });

    return res.status(201).json({
      message:
        "User created. Check your email to confirm (expires in 24 hours).",
    });
  } catch (error) {
    logger.error("Registration failed", {
      context: "auth",
      error: error.message,
      stack: error.stack,
      email: data.email,
    });

    return res.status(500).json({ message: "Failed to register" });
  }
};

export const CONFIRM = async (req, res) => {
  const { rayid } = req.body;

  try {
    const userId = await Redis.get(`confirm:${rayid}`);

    if (!userId) {
      logger.warn("Confirmation failed - invalid or expired rayid", {
        context: "auth",
        rayid,
      });

      return res
        .status(400)
        .json({ message: "Confirmation link invalid or expired" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isConfirmed: true } },
      { new: true }
    );

    if (!user) {
      logger.error("Confirmation failed - user not found", {
        context: "auth",
        rayid,
        userId,
      });

      return res.status(500).json({ message: "User not found" });
    }

    await Redis.del(`confirm:${rayid}`);

    const token = generateAuthToken({ id: user._id });

    const welcomeEmailContent = `
      <p style="font-size: 18px; color: #00FFFF;">You’re In! Welcome to OpenHubble Cloud! 🔭</p>
      <p> </p>
      <p>Congratulations, ${user.firstName}!</p>
      <p>Your email is confirmed—dive into the universe of data insights!</p>
      <p style="margin: 20px 0;">
        <a href="https://cloud.openhubble.com/panel" 
           style="background-color: #00FFFF; color: #1a1a1a; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600; text-shadow: none;">
          Dive Into Your Panel
        </a>
      </p>
      <p>Need help? <a href="mailto:support@openhubble.com" style="color: #00FFFF;">support@openhubble.com</a></p>
      <p>Let’s make cosmic discoveries! 🚀</p>
    `;

    await sendEmail(
      user.email,
      "Welcome to OpenHubble Cloud!",
      welcomeEmailContent
    );

    logger.info("User confirmed", {
      context: "auth",
      userId: user._id.toString(),
      email: user.email,
    });

    return res.status(200).json({ message: "Welcome", token, user });
  } catch (error) {
    logger.error("Confirmation failed", {
      context: "auth",
      error: error.message,
      stack: error.stack,
      rayid,
    });

    return res.status(500).json({ message: "Failed to confirm" });
  }
};

export const RESEND_CONFIRM = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn("Resend confirm failed - email not found", {
        context: "auth",
        email,
      });

      return res.status(404).json({ message: "Email not registered" });
    }

    if (user.isConfirmed) {
      logger.info("Resend confirm skipped - already confirmed", {
        context: "auth",
        email,
      });

      return res.status(400).json({ message: "Email already confirmed" });
    }

    const rayid = generateSecureValue(50);

    await Redis.setex(`confirm:${rayid}`, 24 * 60 * 60, user._id.toString());

    const confirmEmailContent = `
      <p style="font-size: 18px; color: #00FFFF;">OpenHubble Cloud Confirmation 🔭</p>
      <p> </p>
      <p>Here’s a new confirmation link for ${email}—it expires in 24 hours:</p>
      <p style="margin: 20px 0;">
        <a href="https://cloud.openhubble.com/auth/confirm?rayid=${rayid}" 
           style="background-color: #00FFFF; color: #1a1a1a; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600; text-shadow: none;">
          Confirm Now
        </a>
      </p>
      <p>Or paste this: <a href="https://cloud.openhubble.com/auth/confirm?rayid=${rayid}" style="color: #00FFFF; word-break: break-all;">
        https://cloud.openhubble.com/auth/confirm?rayid=${rayid}
      </a></p>
      <p>Let’s get you exploring! 🚀</p>
    `;

    await sendEmail(
      email,
      "New OpenHubble Cloud Confirmation",
      confirmEmailContent
    );

    logger.info("Confirmation resent", {
      context: "auth",
      userId: user._id.toString(),
      email,
    });

    return res.status(200).json({ message: "New confirmation email sent" });
  } catch (error) {
    logger.error("Resend confirm failed", {
      context: "auth",
      error: error.message,
      stack: error.stack,
      email,
    });

    return res.status(500).json({ message: "Failed to resend confirmation" });
  }
};

export const LOGOUT = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    logger.warn("Logout failed - no token provided", { context: "auth" });

    return res.status(400).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, appConfig.secret);
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

    if (expiresIn <= 0) {
      logger.info("Logout - token already expired", {
        context: "auth",
        userId: decoded.id,
      });

      return res.status(200).json({ message: "Already logged out" });
    }

    await Redis.setex(`blacklist:${token}`, expiresIn, "logged_out");

    logger.info("User logged out - token blacklisted", {
      context: "auth",
      userId: decoded.id,
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error("Logout failed", {
      context: "auth",
      error: error.message,
      stack: error.stack,
      token: token.slice(0, 10) + "...",
    });

    return res.status(500).json({ message: "Failed to logout" });
  }
};
