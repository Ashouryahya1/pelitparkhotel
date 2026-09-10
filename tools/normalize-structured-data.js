#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const facts = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "hotel-facts.json"), "utf8"));
const HOTEL_URL = facts.identity.canonicalUrl;
const HOTEL_ID = `${HOTEL_URL}#hotel`;

function filesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if ([".git", "node_modules"].includes(entry.name)) return [];
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(target) : [target];
  });
}

function normalize(node) {
  if (Array.isArray(node)) {
    node.forEach(normalize);
    return;
  }
  if (!node || typeof node !== "object") return;

  if (node["@type"] === "Hotel") {
    node["@id"] = HOTEL_ID;
    node.url = HOTEL_URL;
    node.name = facts.identity.name;
    node.telephone = facts.identity.telephone;
    node.email = facts.identity.email;
    node.hasMap ||= facts.identity.mapUrl;
    if (Array.isArray(node.amenityFeature)) {
      node.amenityFeature = node.amenityFeature.filter((feature) => {
        const name = String(feature?.name || "").toLowerCase();
        return !name.includes("airport transfer") && !name.includes("havalimanı transfer") && !name.includes("نقل من المطار");
      });
    }
  }

  Object.values(node).forEach(normalize);
}

let updated = 0;
for (const file of filesUnder(ROOT).filter((item) => item.endsWith(".html"))) {
  let markup = fs.readFileSync(file, "utf8");
  let changed = false;
  markup = markup.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (full, open, json, close) => {
    let data;
    try {
      data = JSON.parse(json);
    } catch (error) {
      throw new Error(`${path.relative(ROOT, file)} contains invalid JSON-LD: ${error.message}`);
    }
    const before = JSON.stringify(data);
    normalize(data);
    const after = JSON.stringify(data);
    if (after === before) return full;
    changed = true;
    return `${open}\n${JSON.stringify(data, null, 2)}\n    ${close}`;
  });
  if (changed) {
    fs.writeFileSync(file, markup, "utf8");
    updated += 1;
  }
}

console.log(`Normalized structured data in ${updated} HTML files.`);
