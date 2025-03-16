import nodemailer from "nodemailer";

import { emailConfig } from "$app/config/index.js";

const transporter = nodemailer.createTransport({
  host: emailConfig.endpoint,
  port: emailConfig.port,
  secure: false,
  auth: {
    user: emailConfig.username,
    pass: emailConfig.password,
  },
  authMethod: "plain",
});

export const sendEmail = async (to, subject, message) => {
  const mailOptions = {
    from: "no-reply@openhubble.com",
    to,
    subject,
    html: message,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Email sending error: ${error.message}`);
  }
};
