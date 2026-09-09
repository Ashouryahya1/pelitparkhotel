const fs = require("node:fs");
const path = require("node:path");

const translationsDir = path.resolve(__dirname, "..", "translations");
const files = fs.readdirSync(translationsDir).filter((file) => file.endsWith(".json")).sort();

if (!files.length) {
  console.error("No translation files found.");
  process.exit(1);
}

const baseline = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(translationsDir, files[0]), "utf8"))));
let success = true;
for (const file of files.slice(1)) {
  const keys = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(translationsDir, file), "utf8"))));
  const missing = [...baseline].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !baseline.has(key));
  if (missing.length || extra.length) {
    success = false;
    console.error(`${file} does not match ${files[0]} keys.`);
    if (missing.length) console.error(`  Missing: ${missing.join(", ")}`);
    if (extra.length) console.error(`  Extra: ${extra.join(", ")}`);
  }
}
if (!success) process.exit(1);
console.log("All translation files share the same keys.");
