// server/mailer.js
const nodemailer = require('nodemailer');

// Transport instellen (pas dit aan naar jouw SMTP provider)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Standaard verzendfunctie
async function sendMail({ to, subject, text, html, attachments }) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@superhond.be';
  return transporter.sendMail({ from, to, subject, text, html, attachments });
}

// Logo inline toevoegen (optioneel, mag null teruggeven)
function logoAttachment() {
  // Zet je logo bv. in server/assets/logo.png
  // Als er geen logo is, geef null terug
  try {
    return {
      filename: 'logo.png',
      path: __dirname + '/assets/logo.png',
      cid: 'logo-superhond'
    };
  } catch {
    return null;
  }
}

module.exports = { sendMail, logoAttachment };
