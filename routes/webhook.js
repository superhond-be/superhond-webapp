import { Router } from "express";
import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import { forwardToSuperhond, savePending } from "../lib/forwarder.js";

const router = Router();

const DATA_DIR = path.resolve(process.cwd(), "data", "webhooks");
fs.ensureDirSync(DATA_DIR);

function verifySignature(req, secret) {
  if (!secret) return true;
  const sig = req.get("X-Signature") || "";
  if (!sig) return false;
  const computed = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body || {}))
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(computed));
}

router.post("/", async (req, res) => {
  const secret = process.env.WEBHOOK_SECRET || "";
  if (!verifySignature(req, secret)) {
    return res.status(401).json({ ok: false, error: "Invalid signature" });
  }

  const payload = req.body || {};
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  const file = path.join(DATA_DIR, `${stamp}.json`);
  await fs.writeJSON(file, payload, { spaces: 2 });

  // Probeer direct door te sturen naar Superhond API
  try {
    const result = await forwardToSuperhond(payload, {
      source: "mailblue",
      storedFile: file,
      receivedAt: now.toISOString(),
    });
    return res.status(200).json({ ok: true, forwarded: true, result });
  } catch (err) {
    // Sla op als pending voor retry door worker
    const pendingPath = await savePending(payload, {
      error: err.message,
      storedFile: file,
      receivedAt: now.toISOString(),
    });
    return res.status(202).json({ ok: true, forwarded: false, pending: pendingPath });
  }
});

export default router;
