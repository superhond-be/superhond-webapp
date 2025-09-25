// server/initDb.js
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbFile = path.resolve("db/superhond.sqlite");
const schemaFile = path.resolve("db/schema.sql");

// Check of db al bestaat
const dbExists = fs.existsSync(dbFile);

// Open DB (maakt bestand aan als het er nog niet is)
const db = new Database(dbFile);
db.pragma("foreign_keys = ON");

if (!dbExists) {
  console.log("🚀 Nieuwe database wordt aangemaakt...");

  // Lees schema.sql en voer uit
  const schema = fs.readFileSync(schemaFile, "utf-8");
  db.exec(schema);

  console.log("✅ Database opgebouwd uit schema.sql");
} else {
  console.log("ℹ️ Database bestaat al, geen nieuwe tabellen gemaakt.");
}

db.close();
