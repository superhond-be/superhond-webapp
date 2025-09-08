import fs from "fs-extra";
import path from "path";

async function run() {
  const file = process.argv[2];
  if (!file) {
    console.error("Gebruik: node tools/inspect.js data/webhooks/<bestand>.json");
    process.exit(1);
  }

  const abs = path.resolve(file);
  if (!await fs.pathExists(abs)) {
    console.error("Bestand niet gevonden:", abs);
    process.exit(1);
  }

  const data = await fs.readJSON(abs);

  console.log("=== Payload inspect ===");
  console.log("Top-level keys:", Object.keys(data));

  if (data.contact) {
    console.log("\nContactgegevens:");
    for (const [k, v] of Object.entries(data.contact)) {
      console.log(` - ${k}: ${v}`);
    }
  }

  if (data.fields) {
    console.log("\nCustom fields:");
    for (const [k, v] of Object.entries(data.fields)) {
      console.log(` - ${k}: ${v}`);
    }
  }

  if (data.tags) {
    console.log("\nTags:", data.tags.join(", "));
  }

  if (data.automation) {
    console.log("\nAutomatisering:", data.automation.name || data.automation.id);
  }
}

run();
