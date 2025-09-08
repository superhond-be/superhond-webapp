import { Router } from "express";
import fs from "fs-extra";
import path from "path";
import crypto from "crypto";

const router = Router();

// Opslagmap voor ruwe webhook payloads
const DATA_DIR = path.resolve(process.cwd(), "data", "webhooks");
fs.ensureDirSync(DATA_DIR);

// Optionele eenvoudige signature check (X-Signature header met HMAC SHA256 over raw body)
function verifySignature(req, secret) {
  if (!secret) return true; // skip verificatie als geen secret gezet
  const sig = req.get("X-Signature") || "";
  if (!sig) return false;
  // Let op: dit is een vereenvoudigd voorbeeld. Voor productie: raw body gebruiken.
  const computed = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body || {}))
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(computed));
}

router.post("/", async (req, res) => {
  try {
    const secret = process.env.WEBHOOK_SECRET || "";
    if (!verifySignature(req, secret)) {
      return res.status(401).json({ ok: false, error: "Invalid signature" });
    }

    const payload = req.body || {};
    const now = new Date();
    const stamp = now.toISOString().replace(/[:.]/g, "-");
    const file = path.join(DATA_DIR, `${stamp}.json`);

    await fs.writeJSON(file, payload, { spaces: 2 });

    // Mapeer een paar veelvoorkomende MailBlue/ActiveCampaign velden voor snelle debug
    const summary = {
      event: payload?.type || payload?.event || "unknown",
      contact: payload?.contact || payload?.contact_id || payload?.fields?.email || null,
      list: payload?.list || payload?.list_id || null,
      received_at: now.toISOString(),
      saved_to: file
    };

    return res.status(200).json({ ok: true, summary });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
