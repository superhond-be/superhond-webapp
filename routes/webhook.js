import { Router } from "express";
import fs from "fs-extra";
import path from "path";
import { forwardToSuperhond, savePending } from "../lib/forwarder.js";
import { isPaidEvent, isAllowedForSuperhond } from "../lib/filters.js";

const router = Router();

const DATA_DIR = path.resolve(process.cwd(), "data", "webhooks");
const UNPAID_DIR = path.resolve(process.cwd(), "data", "pending-unpaid");
const SKIPPED_DIR = path.resolve(process.cwd(), "data", "skipped-non-superhond");
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(UNPAID_DIR);
fs.ensureDirSync(SKIPPED_DIR);

router.post("/", async (req, res) => {
  const payload = req.body || {};
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  const saved = path.join(DATA_DIR, `${stamp}.json`);
  await fs.writeJSON(saved, payload, { spaces: 2 });

  // 🔎 Log alle tags die we aantreffen
  const tags = [
    ...(Array.isArray(payload.tags) ? payload.tags : []),
    ...(Array.isArray(payload?.contact?.tags) ? payload.contact.tags : []),
  ];
  console.log("📩 Webhook ontvangen → tags:", tags.length ? tags.join(", ") : "(geen tags)");

  // 1) Filter: alleen Superhond-tags doorsturen
  const allowedInfo = isAllowedForSuperhond(payload);
  if (!allowedInfo.allowed) {
    const skipFile = path.join(SKIPPED_DIR, `${stamp}.json`);
    await fs.writeJSON(skipFile, { payload, reason: allowedInfo.reason }, { spaces: 2 });
    console.log(`⏭️  SKIPPED (geen toegestane tag). reason="${allowedInfo.reason}" saved="${skipFile}"`);
    return res.status(202).json({
      ok: true,
      forwarded: false,
      skipped: true,
      reason: allowedInfo.reason,
      saved_to: skipFile
    });
  }

  // 2) Betaald-check (optioneel)
  const requirePaid = /^true$/i.test(process.env.REQUIRE_PAID || "false");
  const paidInfo = isPaidEvent(payload);
  if (requirePaid && !paidInfo.isPaid) {
    const unpaidFile = path.join(UNPAID_DIR, `${stamp}.json`);
    await fs.writeJSON(unpaidFile, { payload, reason: paidInfo.reason }, { spaces: 2 });
    console.log(`🕐 UNPAID (betaal-indicator ontbreekt). reason="${paidInfo.reason}" saved="${unpaidFile}"`);
    return res.status(202).json({
      ok: true,
      forwarded: false,
      pending: "unpaid",
      reason: paidInfo.reason,
      saved_to: unpaidFile
    });
  }

  // 3) Forward
  try {
    const result = await forwardToSuperhond(payload, {
      source: "mailblue",
      storedFile: saved,
      receivedAt: now.toISOString(),
      paid: paidInfo.isPaid,
      tagMatched: allowedInfo.tagMatched
    });
    console.log(`✅ FORWARDED tagMatched="${allowedInfo.tagMatched || '-'}" paid=${paidInfo.isPaid}`);
    return res.status(200).json({ ok: true, forwarded: true, result, paid: paidInfo, allowed: allowedInfo });
  } catch (err) {
    const pendingPath = await savePending(payload, {
      error: err.message,
      storedFile: saved,
      receivedAt: now.toISOString(),
      paid: paidInfo.isPaid,
      tagMatched: allowedInfo.tagMatched
    });
    console.log(`📦 QUEUED (forward failed). error="${err.message}" file="${pendingPath}"`);
    return res.status(202).json({ ok: true, forwarded: false, pending: pendingPath, paid: paidInfo, allowed: allowedInfo });
  }
});

export default router;
