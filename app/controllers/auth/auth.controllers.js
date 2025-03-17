// Models
import { User, Role } from "$app/models/index.js";

// Logger
import logger from "$app/log/index.js";

// Utils
import {
  sendEmail,
  createToken,
  generateSecureValue,
} from "$app/utils/index.js";

// Libs
import md5 from "md5";

export const LOGIN = async (req, res) => {
  const { email, password } = req.body;

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

    const token = createToken({ id: user._id });

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
      rayid,
      isConfirmed: false,
    };

    const user = await User.create(newUser);

    const confirmEmailContent = `
      <p style="font-size: 18px; color: #00FFFF;">Welcome to OpenHubble Cloud! 🔭</p>
      <p> </p>
      <p>You're one step away from diving into your OpenHubble Cloud panel.</p>
      <p>Click below to confirm your email and get started:</p>
      <p style="margin: 20px 0;">
        <a href="https://cloud.openhubble.com/auth/confirm?rayid=${rayid}" 
           style="background-color: #00FFFF; color: #1a1a1a; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600; text-shadow: none;">
          Confirm & Access Panel
        </a>
      </p>
      <p> </p>
      <p>If the button doesn’t work, copy and paste this link into your browser:</p>
      <p><a href="https://cloud.openhubble.com/auth/confirm?rayid=${rayid}" style="color: #00FFFF; word-break: break-all;">
        https://cloud.openhubble.com/auth/confirm?rayid=${rayid}
      </a></p>
      <p> </p>
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
      message: "User created. Please check your email to confirm.",
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
    const user = await User.findOneAndUpdate(
      { rayid },
      { $set: { isConfirmed: true, rayid: null } },
      { new: true }
    );

    if (!user) {
      logger.warn("Confirmation failed - invalid rayid", {
        context: "auth",
        rayid,
      });

      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const token = createToken({ id: user._id });

    const welcomeEmailContent = `
      <p style="font-size: 18px; color: #00FFFF;">You’re In! Welcome to OpenHubble Cloud! 🔭</p>
      <p> </p>
      <p>Congratulations, ${user.firstName}!</p>
      <p>Your email is confirmed, and the universe of data insights is now at your fingertips.</p>
      <p> </p>
      <p>Get ready to explore, analyze, and uncover hidden gems with OpenHubble Cloud.</p>
      <p style="margin: 20px 0;">
        <a href="https://cloud.openhubble.com/panel" 
           style="background-color: #00FFFF; color: #1a1a1a; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600; text-shadow: none;">
          Dive Into Your Panel
        </a>
      </p>
      <p> </p>
      <p>Need help? Reach out anytime at <a href="mailto:support@openhubble.com" style="color: #00FFFF;">support@openhubble.com</a>.</p>
      <p>Let’s make some cosmic discoveries together! 🚀</p>
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

    return res.status(200).json({
      message: "Welcome",
      token,
      user,
    });
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
