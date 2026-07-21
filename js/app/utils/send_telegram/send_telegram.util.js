import axios from "axios";

export const sendTelegramMessage = async (chatID, botToken, message) => {
  const payload = {
    chat_id: chatID,
    text: message,
  };

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      payload
    );

    if (!response.data.ok) {
      throw new Error(`Telegram API error: ${response.data.description}`);
    }

    return response.data;
  } catch (error) {
    throw new Error(`Failed to send Telegram message: ${error.message}`);
  }
};
