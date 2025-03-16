import { createToken, ray } from "$app/functions/index.js";
import { User, Role } from "$app/models/index.js";
import { sendEmail } from "$app/utils/index.js";
import md5 from "md5";

export const LOGIN = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password: md5(password) });

    if (!user || !user.isConfiremed) {
      return res
        .status(401)
        .send({ message: "Invalid credentials or unconfirmed email" });
    }

    return res.status(200).send({
      message: "Welcome",
      token: createToken({ id: user._id }),
      user: user,
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const REGISTER = async (req, res) => {
  const data = req.body;

  try {
    const user = await User.findOne({ email: data.email });

    if (user) {
      return res.status(401).send({ message: "Email already exists" });
    }

    const userRole = await Role.findOne({ value: "user" });

    data.password = md5(data.password);
    data.role = data.role || userRole._id;
    data.rayid = ray.gen(50);
    data.isConfiremed = false;

    const newUser = await User.create(data);

    // Send confirmation email
    const confirmEmailContent = (rayid) => `
      <p style="font-size: 18px; color: #00FFFF;">Welcome to OpenHubble Cloud! 🔭</p>
      <p> </p>
      <p>You're one step away from exploring data and unveiling insights.</p>
      <p>Please confirm your email by clicking the link below:</p>
      <p style="margin: 20px 0;">
        <a href="https://cloud.openhubble.com/api/auth/confirm/${rayid}" 
           style="background-color: #00FFFF; color: #1a1a1a; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600; text-shadow: none;">
          Confirm Your Email
        </a>
      </p>
      <p>If the button doesn’t work, copy and paste this link into your browser:</p>
      <p><a href="https://cloud.openhubble.com/api/auth/confirm/${rayid}" style="color: #00FFFF; word-break: break-all;">
        https://cloud.openhubble.com/api/auth/confirm/${rayid}
      </a></p>
      <p>Happy exploring! 🚀</p>
    `;

    await sendEmail(
      data.email,
      "Confirm Your OpenHubble Cloud Account",
      confirmEmailContent(data.rayid)
    );

    return res.status(200).send({
      message: "User created. Please check your email to confirm.",
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const CONFIRM = async (req, res) => {
  const { rayid } = req.params;

  try {
    const user = await User.findOne({ rayid: rayid });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { isConfiremed: true } }
    );

    return res.json({ message: "Email confirmed successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};
