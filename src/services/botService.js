// Telegram Bot & Webhook Integration Service

const TELEGRAM_CONFIG = {
  botToken: '8895093217:AAEPvP0mq4f1kHk92BjaJIsfedTfH69QOn0',
  chatId: '5671998931',
  webhookUrl: ''
};

export const sendBotNotification = async (messageText) => {
  console.log("🤖 Bot Notification Triggered:\n", messageText);

  // 1. Send via Telegram Bot API
  if (TELEGRAM_CONFIG.botToken && TELEGRAM_CONFIG.chatId) {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CONFIG.chatId,
          text: messageText,
          parse_mode: 'HTML'
        })
      });
      const data = await response.json();
      console.log("✅ Telegram Bot Response:", data);
      return data;
    } catch (err) {
      console.error("❌ Telegram Bot Error:", err);
    }
  }

  // 2. Send via Custom Webhook if configured
  if (TELEGRAM_CONFIG.webhookUrl) {
    try {
      const response = await fetch(TELEGRAM_CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, timestamp: new Date().toISOString() })
      });
      console.log("✅ Webhook Response:", response.status);
    } catch (err) {
      console.error("❌ Webhook Error:", err);
    }
  }

  return { success: true, simulated: false };
};

export const setBotConfig = (botToken, chatId, webhookUrl = '') => {
  if (botToken) TELEGRAM_CONFIG.botToken = botToken;
  if (chatId) TELEGRAM_CONFIG.chatId = chatId;
  if (webhookUrl) TELEGRAM_CONFIG.webhookUrl = webhookUrl;
};
