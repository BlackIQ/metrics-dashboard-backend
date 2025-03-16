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

const emailTemplate = (content) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; background-color: #1a1a1a; color: #ffffff; }
      .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #2a2a2a; border-radius: 10px; border: 2px solid #00FFFF; }
      .header { text-align: center; padding-bottom: 20px; }
      .header h1 { font-size: 28px; color: #00FFFF; font-weight: 600; text-shadow: 0 0 10px #00FFFF; }
      .header p { font-size: 14px; color: #b0b0b0; }
      .content { padding: 20px; background-color: #333333; border-radius: 8px; }
      .content p { font-size: 16px; color: #e0e0e0; }
      .footer { text-align: center; padding-top: 20px; font-size: 12px; color: #b0b0b0; }
      .footer a { color: #00FFFF; text-decoration: none; }
      .footer a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>OpenHubble Cloud</h1>
        <p>Exploring Data, Unveiling Insights</p>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>Visit us at <a href="https://cloud.openhubble.com">cloud.openhubble.com</a> | <a href="https://openhubble.com">openhubble.com</a></p>
        <p>&copy; 2025 OpenHubble. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;

export const sendEmail = async (to, subject, message) => {
  const mailOptions = {
    from: "no-reply@openhubble.com",
    to,
    subject,
    html: emailTemplate(message),
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Email sending error: ${error.message}`);
  }
};
