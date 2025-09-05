function emailTemplate({ title, bodyHtml }) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden">
    <div style="background:#ffd54f;padding:16px;text-align:center">
      <h2 style="margin:8px 0 0;font-size:22px;color:#333">${title}</h2>
    </div>
    <div style="padding:20px;font-size:15px;line-height:1.6;color:#444">
      ${bodyHtml}
    </div>
    <div style="background:#f5f5f5;padding:12px;font-size:12px;color:#777;text-align:center">
      Superhond · Je ontvangt dit bericht omdat je klant bent bij Superhond.
    </div>
  </div>`;
}
module.exports = { emailTemplate };
