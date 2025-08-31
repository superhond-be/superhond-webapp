// public/lessons.js
(() => {
  // Eigen kleine HTTP-helper (los van app.js om conflicts te vermijden)
  async function http(method, url, data) {
    const opt = { method, headers: { "Content-Type": "application/json" } };
    if (data) opt.body = JSON.stringify(data);
    const res = await fetch(url, opt);
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`${res.status} ${res.statusText}${t ? " - " + t : ""}`);
    }
    try { return await res.json(); } catch { return {}; }
  }

  // DOM refs
  let formAdd, btnReload, list;

  // Render helpers
  function escapeHTML(str) {
    if (str == null) return "";
    return String
