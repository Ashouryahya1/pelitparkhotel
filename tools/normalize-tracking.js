const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SHARED_SCRIPT = '<script src="/assets/js/booking-events.js"></script>';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if ([".git", "node_modules", ".codex-tmp"].includes(entry.name)) return [];
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

let changed = 0;
for (const file of walk(ROOT).filter((item) => item.endsWith(".html"))) {
  let html = fs.readFileSync(file, "utf8");
  if (!/https:\/\/(?:wa\.me|api\.whatsapp\.com|pelit-park\.rezervasyonal\.com)/i.test(html)) continue;

  const original = html;
  html = html.replace(/<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi, (block) => {
    if (/function\s+gtag_report_conversion\s*\(/.test(block)) return "";
    if (/document\.addEventListener\s*\(\s*["']click["']/.test(block) &&
        /(?:data-booking-event|whatsappLink|whatsapp_click)/.test(block)) return "";
    return block;
  });
  html = html.replace(/\s*<script\s+src=["']\/assets\/js\/booking-events\.js["']\s*><\/script>/gi, "");
  html = html.replace(/\s*<\/body>/i, `\n    ${SHARED_SCRIPT}\n  </body>`);

  if (html !== original) {
    fs.writeFileSync(file, html);
    changed += 1;
  }
}

console.log(`Normalized outbound-click tracking on ${changed} HTML pages.`);
