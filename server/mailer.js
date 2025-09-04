const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
async function sendMail({ to, subject, text, html, attachments }) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@superhond.be';
  return transporter.sendMail({ from, to, subject, text, html, attachments });
}
function logoAttachment(){
  try { return { filename:'logo.png', path: __dirname + '/assets/logo.png', cid:'logo-superhond' }; }
  catch { return null; }
}
module.exports = { sendMail, logoAttachment };
