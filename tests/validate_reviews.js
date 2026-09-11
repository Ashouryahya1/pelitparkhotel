const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const authors = ["Turnay", "Arina", "Sergey", "Juliane", "Aytan"];
const normalizeFooter = (html) => html.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0]
  .replace(/(src=["'])(?:\.\.\/|\.\/)*assets\//g, "$1/assets/")
  .replace(/\s+/g, " ").trim();

for (const prefix of ["", "en/", "ar/"]) {
  const html = fs.readFileSync(path.join(root, prefix, "reviews/index.html"), "utf8");
  const home = fs.readFileSync(path.join(root, prefix, "index.html"), "utf8");
  const quotations = [...html.matchAll(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/g)].map((match) => match[1]);
  assert.equal(quotations.length, 10, `${prefix}: restore both platforms' five reviews`);
  assert.ok(quotations.every((quote) => quote.trim().length > 40), `${prefix}: review bodies must contain the historical quotations, not empty placeholders`);
  assert.doesNotMatch(html, /\bundefined\b/, `${prefix}: all review text and stay details must be present`);
  const booking = html.split('id="booking-reviews"')[1]?.split("</section>")[0];
  assert.ok(booking, `${prefix}: Booking reviews must remain visible in static HTML`);
  assert.equal((booking.match(/<blockquote\b/g) || []).length, 5, `${prefix}: keep all five previous Booking reviews`);
  for (const author of authors) assert.ok(booking.includes(`data-review-author="${author}"`), `${prefix}: missing ${author}`);
  assert.match(booking, /<strong dir="ltr">9<small> \/ 10<\/small><\/strong>/, `${prefix}: Booking score must remain 9/10`);
  assert.equal(normalizeFooter(html), normalizeFooter(home), `${prefix}: review footer must match the localized homepage`);
  assert.doesNotMatch(html, /georgian-breadcrumb/, `${prefix}: keep visible breadcrumbs off the review page`);
  assert.doesNotMatch(html, /aggregateRating|Instead of publishing a fixed rating|doğrudan bağlantı veriyoruz|بدل نشر تقييم/, `${prefix}: do not restore removed ratings markup or bureaucratic copy`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${prefix}: keep one page heading`);
}

console.log("Validated restored Booking reviews, score, localized footers and page structure in all three languages.");
