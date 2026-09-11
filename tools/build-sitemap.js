#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const SITEMAP = path.join(ROOT, "sitemap.xml");
const TODAY = new Date().toISOString().slice(0, 10);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if ([".git", "node_modules"].includes(entry.name)) return [];
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function existingDates() {
  if (!fs.existsSync(SITEMAP)) return new Map();
  const xml = fs.readFileSync(SITEMAP, "utf8");
  return new Map([...xml.matchAll(/<url>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<lastmod>(.*?)<\/lastmod>[\s\S]*?<\/url>/g)].map((match) => [match[1], match[2]]));
}

function changedFiles() {
  const output = execFileSync("git", ["status", "--porcelain=v1", "-z"], { cwd: ROOT, encoding: "utf8" });
  const changed = new Set();
  for (const record of output.split("\0").filter(Boolean)) {
    const relative = record.slice(3).replace(/\\/g, "/");
    changed.add(relative);
  }
  return changed;
}

function esc(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const oldDates = existingDates();
const dirty = changedFiles();
const rows = [];

for (const file of walk(ROOT).filter((item) => item.endsWith("index.html"))) {
  const html = fs.readFileSync(file, "utf8");
  const robots = html.match(/<meta\b(?=[^>]*name=["']robots["'])[^>]*content=["']([^"']*)["'][^>]*>/i)?.[1] || "";
  if (/noindex/i.test(robots)) continue;
  const canonical = html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*href=["']([^"']+)["'][^>]*>/i)?.[1];
  if (!canonical || !canonical.startsWith("https://pelitparkhotel.com/")) continue;
  const relative = path.relative(ROOT, file).replace(/\\/g, "/");
  const lastmod = dirty.has(relative) || !oldDates.has(canonical) ? TODAY : oldDates.get(canonical);
  const urlPath = new URL(canonical).pathname;
  const isHome = ["/", "/en/", "/ar/", "/ka/", "/ru/", "/az/"].includes(urlPath);
  const isLocation = /(airport|havaliman|forum-trabzon|farabi)/i.test(urlPath);
  rows.push({ canonical, lastmod, changefreq: isHome ? "weekly" : "monthly", priority: urlPath === "/" ? "1.0" : isHome ? "0.9" : isLocation ? "0.8" : "0.7" });
}

rows.sort((a, b) => a.canonical.localeCompare(b.canonical));
const body = rows.map((row) => `  <url>\n    <loc>${esc(row.canonical)}</loc>\n    <lastmod>${row.lastmod}</lastmod>\n    <changefreq>${row.changefreq}</changefreq>\n    <priority>${row.priority}</priority>\n  </url>`).join("\n");
fs.writeFileSync(SITEMAP, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, "utf8");
console.log(`Built sitemap.xml with ${rows.length} indexable canonical URLs.`);
