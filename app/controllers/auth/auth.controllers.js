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
        <a href="https://cloud.openhubble.com/auth/confirm/account?rayid=${rayid}" 
           style="background-color: #00FFFF; color: #1a1a1a; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600; text-shadow: none;">
          Confirm & Access Panel
        </a>
      </p>
      <p> </p>
      <p>Or paste this: <a href="https://cloud.openhubble.com/auth/confirm/account?rayid=${rayid}" style="color: #00FFFF; word-break: break-all;">
        https://cloud.openhubble.com/auth/confirm/account?rayid=${rayid}
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
        <a href="https://cloud.openhubble.com/auth/confirm/account?rayid=${rayid}" 
           style="background-color: #00FFFF; color: #1a1a1a; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600; text-shadow: none;">
          Confirm Now
        </a>
      </p>
      <p>Or paste this: <a href="https://cloud.openhubble.com/auth/confirm/account?rayid=${rayid}" style="color: #00FFFF; word-break: break-all;">
        https://cloud.openhubble.com/auth/confirm/account?rayid=${rayid}
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

export const CHANGE_EMAIL = async (req, res) => {
  const { newEmail } = req.body;
  const { id } = req.user;

  try {
    const user = await User.findById(id).lean();

    if (!user) {
      logger.warn("Change email failed - user not found", {
        context: "auth",
        userId: id,
      });

      return res.status(404).json({ message: "User not found" });
    }

    if (user.email === newEmail) {
      logger.info("Change email skipped - same email", {
        context: "auth",
        userId: user._id.toString(),
        newEmail,
      });

      return res.status(400).json({ message: "New email must be different" });
    }

    const existingUser = await User.findOne({ email: newEmail });

    if (existingUser) {
      logger.warn("Change email failed - email already in use", {
        context: "auth",
        userId: user._id.toString(),
        newEmail,
      });

      return res.status(409).json({ message: "Email already in use" });
    }

    const rayid = generateSecureValue(50);

    await Redis.setex(
      `email-change:${rayid}`,
      24 * 60 * 60,
      JSON.stringify({ userId: user._id.toString(), newEmail })
    );

    const confirmEmailContent = `
      <p style="font-size: 18px; color: #00FFFF;">OpenHubble Cloud Email Change 🔭</p>
      <p>You’ve requested to change your email to ${newEmail}.</p>
      <p>This link expires in 24 hours—click below to confirm:</p>
      <p style="margin: 20px 0;">
        <a href="https://cloud.openhubble.com/auth/confirm/email?rayid=${rayid}" 
           style="background-color: #00FFFF; color: #1a1a1a; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600;">
          Confirm New Email
        </a>
      </p>
      <p>Or paste this: <a href="https://cloud.openhubble.com/auth/confirm/email?rayid=${rayid}" style="color: #00FFFF; word-break: break-all;">
        https://cloud.openhubble.com/auth/confirm/email?rayid=${rayid}
      </a></p>
      <p>Not you? Contact <a href="mailto:support@openhubble.com" style="color: #00FFFF;">support@openhubble.com</a>.</p>
      <p>Stay cosmic! 🚀</p>
    `;

    await sendEmail(
      newEmail,
      "Confirm Your New OpenHubble Cloud Email",
      confirmEmailContent
    );

    logger.info("Email change requested", {
      context: "auth",
      userId: user._id.toString(),
      newEmail,
    });

    return res.status(200).json({
      message:
        "Check your new email to confirm the change (expires in 24 hours).",
    });
  } catch (error) {
    logger.error("Change email failed", {
      context: "auth",
      error: error.message,
      stack: error.stack,
      newEmail,
    });

    return res.status(500).json({ message: "Failed to request email change" });
  }
};

export const CONFIRM_EMAIL_CHANGE = async (req, res) => {
  const { rayid } = req.body;

  try {
    const changeData = await Redis.get(`email-change:${rayid}`);

    if (!changeData) {
      logger.warn(
        "Email change confirmation failed - invalid or expired rayid",
        {
          context: "auth",
          rayid,
        }
      );

      return res
        .status(400)
        .json({ message: "Confirmation link invalid or expired" });
    }

    const { userId, newEmail } = JSON.parse(changeData);

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { email: newEmail } },
      { new: true }
    ).lean();

    if (!user) {
      logger.error("Email change confirmation failed - user not found", {
        context: "auth",
        rayid,
        userId,
      });

      return res.status(500).json({ message: "User not found" });
    }

    await Redis.del(`email-change:${rayid}`);

    const confirmationEmailContent = `
      <p style="font-size: 18px; color: #00FFFF;">Email Updated! 🔭</p>
      <p>Your OpenHubble Cloud email has been changed to ${newEmail}.</p>
      <p style="margin: 20px 0;">
        <a href="https://cloud.openhubble.com/panel" 
           style="background-color: #00FFFF; color: #1a1a1a; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600;">
          Back to Your Panel
        </a>
      </p>
      <p>Need help? <a href="mailto:support@openhubble.com" style="color: #00FFFF;">support@openhubble.com</a></p>
      <p>Keep exploring! 🚀</p>
    `;

    await sendEmail(
      newEmail,
      "OpenHubble Cloud Email Change Confirmed",
      confirmationEmailContent
    );

    logger.info("Email change confirmed", {
      context: "auth",
      userId: user._id.toString(),
      newEmail,
    });

    return res.status(200).json({
      message: "Email updated successfully",
      user,
    });
  } catch (error) {
    logger.error("Email change confirmation failed", {
      context: "auth",
      error: error.message,
      stack: error.stack,
      rayid,
    });

    return res.status(500).json({ message: "Failed to confirm email change" });
  }
};

export const FORGOT_PASSWORD = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email }).lean();

    if (!user) {
      logger.warn("Forgot password failed - email not found", {
        context: "auth",
        email,
      });

      return res.status(200).json({
        message: "If the email exists, a reset link has been sent.",
      });
    }

    if (!user.isConfirmed) {
      logger.warn("Forgot password failed - email not confirmed", {
        context: "auth",
        email,
      });

      return res.status(200).json({
        message: "If the email exists, a reset link has been sent.",
      });
    }

    const rayid = generateSecureValue(50);
    await Redis.setex(`reset:${rayid}`, 60 * 60, user._id.toString());

    const resetEmailContent = `
      <p style="font-size: 18px; color: #00FFFF;">OpenHubble Cloud Password Reset 🔭</p>
      <p>We received a request to reset your password.</p>
      <p>This link expires in 1 hour—click below to reset:</p>
      <p style="margin: 20px 0;">
        <a href="https://cloud.openhubble.com/auth/reset/password?rayid=${rayid}" 
           style="background-color: #00FFFF; color: #1a1a1a; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600;">
          Reset Password
        </a>
      </p>
      <p>Or paste this: <a href="https://cloud.openhubble.com/auth/reset/password?rayid=${rayid}" style="color: #00FFFF; word-break: break-all;">
        https://cloud.openhubble.com/auth/reset/password?rayid=${rayid}
      </a></p>
      <p>Not you? Contact <a href="mailto:support@openhubble.com" style="color: #00FFFF;">support@openhubble.com</a>.</p>
      <p>Stay cosmic! 🚀</p>
    `;

    await sendEmail(
      email,
      "Reset Your OpenHubble Cloud Password",
      resetEmailContent
    );

    logger.info("Password reset requested", {
      context: "auth",
      userId: user._id.toString(),
      email,
    });

    return res.status(200).json({
      message: "If the email exists, a reset link has been sent.",
    });
  } catch (error) {
    logger.error("Forgot password failed", {
      context: "auth",
      error: error.message,
      stack: error.stack,
      email,
    });

    return res.status(500).json({ message: "Failed to process request" });
  }
};

export const RESET_PASSWORD = async (req, res) => {
  const { rayid, newPassword } = req.body;

  try {
    const userId = await Redis.get(`reset:${rayid}`);

    if (!userId) {
      logger.warn("Password reset failed - invalid or expired rayid", {
        context: "auth",
        rayid,
      });

      return res.status(400).json({ message: "Reset link invalid or expired" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { password: md5(newPassword) } },
      { new: true }
    ).lean();

    if (!user) {
      logger.error("Password reset failed - user not found", {
        context: "auth",
        rayid,
        userId,
      });
      return res.status(500).json({ message: "User not found" });
    }

    await Redis.del(`reset:${rayid}`);

    const confirmationEmailContent = `
      <p style="font-size: 18px; color: #00FFFF;">Password Reset Complete! 🔭</p>
      <p>Your OpenHubble Cloud password has been updated.</p>
      <p style="margin: 20px 0;">
        <a href="https://cloud.openhubble.com/auth" 
           style="background-color: #00FFFF; color: #1a1a1a; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600;">
          Log In Now
        </a>
      </p>
      <p>Need help? <a href="mailto:support@openhubble.com" style="color: #00FFFF;">support@openhubble.com</a></p>
      <p>Back to exploring! 🚀</p>
    `;

    await sendEmail(
      user.email,
      "OpenHubble Cloud Password Reset Confirmed",
      confirmationEmailContent
    );

    logger.info("Password reset completed", {
      context: "auth",
      userId: user._id.toString(),
      email: user.email,
    });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    logger.error("Password reset failed", {
      context: "auth",
      error: error.message,
      stack: error.stack,
      rayid,
    });

    return res.status(500).json({ message: "Failed to reset password" });
  }
};
