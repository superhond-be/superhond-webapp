import fs from "fs-extra";
import path from "path";
import { customAlphabet } from "nanoid";

const nano = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", 10);

const DATA_DIR = path.resolve(process.cwd(), "data");
const RAW_DIR = path.join(DATA_DIR, "raw");
const DB_DIR = path.join(DATA_DIR, "db");
const CUSTOMERS_FILE = path.join(DB_DIR, "customers.json");
const DOGS_FILE = path.join(DB_DIR, "dogs.json");
const CREDITS_FILE = path.join(DB_DIR, "credits.json");

export function ensureDataDirs() {
  fs.ensureDirSync(RAW_DIR);
  fs.ensureDirSync(DB_DIR);
  for (const f of [CUSTOMERS_FILE, DOGS_FILE, CREDITS_FILE]) {
    if (!fs.existsSync(f)) fs.writeJSONSync(f, [], { spaces: 2 });
  }
}

export async function saveRaw(source, payload) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(RAW_DIR, `${source}-${stamp}.json`);
  await fs.writeJSON(file, payload, { spaces: 2 });
  return file;
}

async function readJsonArray(file) {
  try { return await fs.readJSON(file); } catch { return []; }
}
async function writeJsonArray(file, arr) {
  await fs.writeJSON(file, arr, { spaces: 2 });
}

export async function upsertCustomer(c) {
  const items = await readJsonArray(CUSTOMERS_FILE);
  const idx = items.findIndex(x => x.email && x.email.toLowerCase() === (c.email||"").toLowerCase());
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...c, updatedAt: new Date().toISOString() };
    await writeJsonArray(CUSTOMERS_FILE, items);
    return items[idx];
  }
  const newItem = {
    id: c.id || `C_${nano()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...c
  };
  items.push(newItem);
  await writeJsonArray(CUSTOMERS_FILE, items);
  return newItem;
}

export async function upsertDog(customerId, d) {
  const items = await readJsonArray(DOGS_FILE);
  const idx = items.findIndex(x => x.customerId === customerId && x.name.toLowerCase() === (d.name||"").toLowerCase());
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...d, updatedAt: new Date().toISOString() };
    await writeJsonArray(DOGS_FILE, items);
    return items[idx];
  }
  const newItem = {
    id: d.id || `D_${nano()}`,
    customerId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...d
  };
  items.push(newItem);
  await writeJsonArray(DOGS_FILE, items);
  return newItem;
}

export async function addCredit(customerId, credit) {
  const items = await readJsonArray(CREDITS_FILE);
  const newItem = {
    id: `CR_${nano()}`,
    customerId,
    ...credit,
    createdAt: new Date().toISOString()
  };
  items.push(newItem);
  await writeJsonArray(CREDITS_FILE, items);
  return newItem;
}
