import fs from "fs-extra";
import path from "path";
import axios from "axios";

const QUEUE_DIR = path.resolve(process.cwd(), "data", "queue");
const LOG_FILE = path.resolve(process.cwd(), "data", "forwarder.log");
fs.ensureDirSync(QUEUE_DIR);
fs.ensureFileSync(LOG_FILE);

function log(line) {
  const ts = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${ts}] ${line}\n`);
}

export async function forwardToSuperhond(payload, meta = {}) {
  const url = process.env.SUPERHOND_API_URL;
  if (!url) {
    throw new Error("SUPERHOND_API_URL ontbreekt");
  }
  const headers = { "Content-Type": "application/json" };
  if (process.env.SUPERHOND_API_KEY) {
    headers["Authorization"] = `Bearer ${process.env.SUPERHOND_API_KEY}`;
  }

  const body = {
    source: meta.source || "mailblue",
    receivedAt: meta.receivedAt || new Date().toISOString(),
    storedFile: meta.storedFile || null,
    paid: meta.paid || false,
    tagMatched: meta.tagMatched || null,
    payload,
  };

  let attempt = 0;
  let lastErr = null;
  while (attempt < 5) {
    try {
      const res = await axios.post(url, body, { headers, timeout: 10000 });
      log(`SUCCESS attempt=${attempt+1} status=${res.status} url=${url}`);
      return { status: res.status, data: res.data };
    } catch (err) {
      lastErr = err;
      attempt++;
      const waitMs = Math.pow(2, attempt - 1) * 500;
      log(`RETRY attempt=${attempt} wait=${waitMs}ms error=${err.message}`);
      await new Promise(r => setTimeout(r, waitMs));
    }
  }
  throw new Error(`Forwarden mislukt na 5 pogingen: ${lastErr?.message || "onbekend"}`);
}

export async function savePending(payload, meta = {}) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(QUEUE_DIR, `pending-${stamp}.json`);
  const record = { payload, meta, retries: 0, nextAttemptAt: Date.now() };
  await fs.writeJSON(file, record, { spaces: 2 });
  const reason = meta.error || meta.reason || "unknown";
  log(`QUEUED ${path.basename(file)} (reason: ${reason})`);
  return file;
}

export function startQueueWorker() {
  const interval = Number(process.env.QUEUE_INTERVAL_MS || 15000);
  async function tick() {
    try {
      const files = (await fs.readdir(QUEUE_DIR)).filter(f => f.endsWith(".json")).sort();
      for (const fname of files) {
        const fpath = path.join(QUEUE_DIR, fname);
        const rec = await fs.readJSON(fpath);
        if (Date.now() < (rec.nextAttemptAt || 0)) continue;
        try {
          const res = await forwardToSuperhond(rec.payload, rec.meta || {});
          log(`DEQUEUED success ${fname}`);
          await fs.remove(fpath);
        } catch (err) {
          rec.retries = (rec.retries || 0) + 1;
          const backoff = Math.min(600000, Math.pow(2, rec.retries) * 1000);
          rec.nextAttemptAt = Date.now() + backoff;
          await fs.writeJSON(fpath, rec, { spaces: 2 });
          log(`DEQUEUED fail ${fname} retries=${rec.retries} next=${new Date(rec.nextAttemptAt).toISOString()} reason=${err.message}`);
        }
      }
    } catch (err) {
      log(`WORKER ERROR ${err.message}`);
    }
  }
  setInterval(tick, interval);
  log(`Worker gestart interval=${interval}ms`);
  tick();
}
