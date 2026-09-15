const fs = require("node:fs");
const path = require("node:path");
const { ROOT, languages, groups, guideGroups } = require("./lib/site-languages");
const copy = require("../data/home-booking.json");
const facts = require("../data/hotel-facts.json");
const e = value => String(value).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Run after locale generation: each homepage receives its own copy, including
// manually maintained EN/AR/KA pages. Preserve the hero slogan and About text.
for (const lang of Object.keys(languages)) {
  const d = copy[lang];
  if (!d) throw new Error(`Missing home booking copy: ${lang}`);
  const file = path.join(ROOT, languages[lang].home, "index.html");
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${e(d.title)}</title>`);
  for (const [attribute, name, value] of [
    ["name", "description", d.description],
    ["property", "og:title", d.title], ["property", "og:description", d.description],
    ["name", "twitter:title", d.title], ["name", "twitter:description", d.description],
  ]) {
    const tag = `<meta ${attribute}="${name}" content="${e(value)}" />`;
    const pattern = new RegExp(`<meta\\b[^>]*${attribute}=["']${name}["'][^>]*>`, "i");
    html = pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `${tag}\n</head>`);
  }
  html = html.replace(/(<h1\b[^>]*>)[\s\S]*?<\/h1>/i, `$1${e(d.h1)}</h1>`);
  const section = `<!-- HOME_BOOKING_START --><section class="section__container international-prose" id="rooms-and-rates" aria-labelledby="rooms-and-rates-title"><h2 class="section__header" id="rooms-and-rates-title">${e(d.heading)}</h2><p class="section__description">${e(d.location)}</p><p class="section__description">${e(d.rates)}</p><div class="guide-actions"><a class="btn" href="${e(facts.booking.engineUrl)}" target="_blank" rel="noopener noreferrer" data-booking-event="booking_click">${e(d.book)}</a></div><p><a class="guide-read" href="${guideGroups["guide:hotel-prices"][lang]}">${e(d.prices)}</a></p><p><a class="guide-read" href="${groups.rooms[lang]}">${e(d.rooms)}</a></p></section><!-- HOME_BOOKING_END -->`;
  if (html.includes("<!-- HOME_BOOKING_START -->")) {
    html = html.replace(/<!-- HOME_BOOKING_START -->[\s\S]*?<!-- HOME_BOOKING_END -->/, section);
  } else {
    const anchor = /<section\b[^>]*\bid="(?:about|why-us)"[^>]*>[\s\S]*?<\/section>/;
    if (!anchor.test(html)) throw new Error(`Missing home content anchor: ${lang}`);
    html = html.replace(anchor, match => match + "\n" + section);
  }
  fs.writeFileSync(file, html);
}
console.log("Updated homepage search copy and room/rate links in seven languages.");
