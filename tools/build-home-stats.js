#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const stats = require("../data/home-stats.json");
const ROOT = path.resolve(__dirname, "..");
const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));

for (const [lang, labels] of Object.entries(stats.labels)) {
  const file = path.join(ROOT, lang === "tr" ? "" : lang, "index.html");
  let html = fs.readFileSync(file, "utf8");
  const cards = [
    [stats.bookingRating, labels.booking],
    [stats.googleRating, labels.google],
    [stats.completedBookings, labels.bookings],
  ].map(([value, label]) => `        <div class="banner__card">
          <h4 dir="ltr">${escapeHtml(value)}</h4>
          <p>${escapeHtml(label)}</p>
        </div>`).join("\n");
  const section = `<section class="section__container banner__container" id="guest-stats" aria-label="${escapeHtml(labels.section)}">
      <div class="banner__content">
${cards}
      </div>
    </section>`;

  // Replace just the original statistics section, preserving every other
  // homepage section and its language. Never add data-translate markers here:
  // that would make build-i18n treat the whole Turkish homepage as a template.
  const existing = /<section\b[^>]*class="[^"]*\bbanner__container\b[^"]*"[^>]*>[\s\S]*?<\/section>/g;
  const matches = [...html.matchAll(existing)];
  if (matches.length === 1) {
    html = html.replace(existing, section);
  } else if (matches.length === 0 && lang === "ka") {
    const anchor = '<section class="section__container georgian-faq"';
    if (!html.includes(anchor)) throw new Error("Georgian homepage insertion point missing");
    html = html.replace(anchor, `${section}\n\n      ${anchor}`);
  } else {
    throw new Error(`Expected one homepage statistics section in ${lang}; found ${matches.length}`);
  }
  fs.writeFileSync(file, html, "utf8");
  console.log(`Restored homepage statistics: ${path.relative(ROOT, file)}`);
}
