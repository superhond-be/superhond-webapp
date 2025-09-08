import { Router } from "express";
import fs from "fs-extra";
import path from "path";
import { forwardToSuperhond, savePending } from "../lib/forwarder.js";
import { isPaidEvent } from "../lib/paid.js";

const router = Router();

const DATA_DIR = path.resolve(process.cwd(), "data", "webhooks");
const UNPAID_DIR = path.resolve(process.cwd(), "data", "pending-unpaid");
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(UNPAID_DIR);

router.post("/", async (req, res) => {
  const payload = req.body || {};
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  const file = path.join(DATA_DIR, `${stamp}.json`);
  await fs.writeJSON(file, payload, { spaces: 2 });

  const requirePaid = /^true$/i.test(process.env.REQUIRE_PAID || "false");
  const paidInfo = isPaidEvent(payload);

  if (requirePaid && !paidInfo.isPaid) {
    const unpaidFile = path.join(UNPAID_DIR, `${stamp}.json`);
    await fs.writeJSON(unpaidFile, { payload, reason: paidInfo.reason }, { spaces: 2 });
    return res.status(202).json({
      ok: true,
      forwarded: false,
      pending: "unpaid",
      reason: paidInfo.reason,
      saved_to: unpaidFile
    });
  }

  try {
    const result = await forwardToSuperhond(payload, {
      source: "mailblue",
      storedFile: file,
      receivedAt: now.toISOString(),
      paid: paidInfo.isPaid
    });
    return res.status(200).json({ ok: true, forwarded: true, result, paid: paidInfo });
  } catch (err) {
    const pendingPath = await savePending(payload, {
      error: err.message,
      storedFile: file,
      receivedAt: now.toISOString(),
      paid: paidInfo.isPaid
    });
    return res.status(202).json({ ok: true, forwarded: false, pending: pendingPath, paid: paidInfo });
  }
});

export default router;
