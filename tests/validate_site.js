const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DOMAIN = "https://pelitparkhotel.com";
const GEORGIAN_PAGES = new Map([
  ["ka/index.html", `${DOMAIN}/ka/`],
  ["ka/hotel-near-forum-trabzon/index.html", `${DOMAIN}/ka/hotel-near-forum-trabzon/`],
  ["ka/hotel-near-farabi-hospital/index.html", `${DOMAIN}/ka/hotel-near-farabi-hospital/`],
  ["ka/hotel-near-trabzon-airport/index.html", `${DOMAIN}/ka/hotel-near-trabzon-airport/`],
  ["ka/batumi-trabzon/index.html", `${DOMAIN}/ka/batumi-trabzon/`],
  ["ka/room-types/index.html", `${DOMAIN}/ka/room-types/`],
]);
const GENERATED_LANGUAGE_PAGES = [
  "index.html",
  "about/index.html",
  "explore/index.html",
  "room-types/index.html",
  "services/Consulting-Service/index.html",
  "services/airport-transfers/index.html",
  "services/flexible-booking/index.html",
  "travel-tips/index.html",
];
const GEORGIAN_SITEMAP_DATES = new Map([
  [`${DOMAIN}/ka/`, "2026-09-12"],
  [`${DOMAIN}/ka/hotel-near-forum-trabzon/`, "2026-09-12"],
  [`${DOMAIN}/ka/hotel-near-farabi-hospital/`, "2026-09-12"],
  [`${DOMAIN}/ka/hotel-near-trabzon-airport/`, "2026-09-12"],
  [`${DOMAIN}/ka/batumi-trabzon/`, "2026-09-12"],
  [`${DOMAIN}/ka/room-types/`, "2026-09-12"],
]);

const errors = [];
const hotelFacts = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "hotel-facts.json"), "utf8"));
if (hotelFacts.identity.canonicalUrl !== `${DOMAIN}/` || !hotelFacts.identity.telephone || !hotelFacts.identity.email) {
  errors.push("data/hotel-facts.json must contain the canonical hotel identity and contact details");
}
if (hotelFacts.arrival.hotelOperatedAirportTransferPublished !== false || hotelFacts.rooms.twin.viewPublished !== false) {
  errors.push("unverified airport-transfer and Twin-view claims must remain unpublished in hotel-facts.json");
}
if (!hotelFacts.booking.breakfastPolicy.toLowerCase().includes("selected rate")) {
  errors.push("hotel-facts.json must keep breakfast inclusion dependent on the selected rate");
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules") return [];
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function attributes(markup) {
  const result = {};
  for (const match of markup.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/gs)) {
    result[match[1].toLowerCase()] = match[3];
  }
  return result;
}

function firstMatch(html, regex) {
  return html.match(regex)?.[1]?.replace(/<[^>]+>/g, "").trim() || "";
}

function parsePage(file) {
  const html = fs.readFileSync(file, "utf8");
  const metas = [...html.matchAll(/<meta\b([^>]*)>/gi)].map((match) => attributes(match[1]));
  const links = [...html.matchAll(/<link\b([^>]*)>/gi)].map((match) => attributes(match[1]));
  const anchors = [...html.matchAll(/<a\b([^>]*)>/gi)].map((match) => attributes(match[1]));
  const images = [...html.matchAll(/<img\b([^>]*)>/gi)].map((match) => attributes(match[1]));
  const jsonld = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]));
  const alternates = Object.fromEntries(
    links.filter((item) => item.rel === "alternate" && item.hreflang).map((item) => [item.hreflang, item.href])
  );

  return {
    html,
    title: firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: metas.find((item) => item.name === "description")?.content || "",
    robots: metas.find((item) => item.name === "robots")?.content || "",
    ogTitle: metas.find((item) => item.property === "og:title")?.content || "",
    ogDescription: metas.find((item) => item.property === "og:description")?.content || "",
    ogUrl: metas.find((item) => item.property === "og:url")?.content || "",
    ogImage: metas.find((item) => item.property === "og:image")?.content || "",
    twitterCard: metas.find((item) => item.name === "twitter:card")?.content || "",
    twitterTitle: metas.find((item) => item.name === "twitter:title")?.content || "",
    twitterDescription: metas.find((item) => item.name === "twitter:description")?.content || "",
    twitterImage: metas.find((item) => item.name === "twitter:image")?.content || "",
    canonicals: links.filter((item) => item.rel === "canonical").map((item) => item.href),
    alternates,
    anchors,
    images,
    jsonld,
    h1Count: (html.match(/<h1\b/gi) || []).length,
    hasBreadcrumb: /class=["'][^"']*georgian-breadcrumb/.test(html),
  };
}

function collectTypes(node, types = new Set()) {
  if (Array.isArray(node)) {
    node.forEach((item) => collectTypes(item, types));
  } else if (node && typeof node === "object") {
    if (typeof node["@type"] === "string") types.add(node["@type"]);
    Object.values(node).forEach((item) => collectTypes(item, types));
  }
  return types;
}

function localTargetExists(value, source) {
  if (!value || /^(?:https?:|mailto:|tel:|javascript:|#)/i.test(value)) return true;
  const clean = decodeURIComponent(value.split(/[?#]/)[0]);
  let target = clean.startsWith("/")
    ? path.join(ROOT, clean.replace(/^\/+/, ""))
    : path.resolve(path.dirname(source), clean);
  if (clean.endsWith("/") || (fs.existsSync(target) && fs.statSync(target).isDirectory())) {
    target = path.join(target, "index.html");
  }
  return fs.existsSync(target);
}

const htmlFiles = walk(ROOT).filter((file) => file.endsWith(".html"));
for (const file of htmlFiles) {
  const page = parsePage(file);
  const rel = path.relative(ROOT, file).replaceAll(path.sep, "/");
  if (page.hasBreadcrumb) errors.push(`${rel}: visible page breadcrumbs must be removed`);
  for (const anchor of page.anchors) {
    if (!localTargetExists(anchor.href, file)) errors.push(`${rel}: broken local link ${anchor.href}`);
  }
  for (const image of page.images) {
    if (!localTargetExists(image.src, file)) errors.push(`${rel}: missing image ${image.src}`);
  }
  if (/https:\/\/(?:wa\.me|api\.whatsapp\.com|pelit-park\.rezervasyonal\.com)/i.test(page.html)) {
    const trackingScripts = page.html.match(/<script\s+src=["']\/assets\/js\/booking-events\.js(?:\?[^"']*)?["']\s*><\/script>/gi) || [];
    if (trackingScripts.length !== 1) errors.push(`${rel}: expected exactly one shared booking-events script`);
    if (/function\s+gtag_report_conversion\s*\(/.test(page.html)) errors.push(`${rel}: legacy conversion callback must be removed`);
    if (/document\.addEventListener\s*\(\s*["']click["'][\s\S]{0,1200}(?:market:\s*["']georgia|booking_intent:\s*["']same_day)/.test(page.html)) {
      errors.push(`${rel}: legacy page-specific click tracking must be removed`);
    }
  }
  for (const match of page.html.matchAll(/<details[^>]+class=["'][^"']*language-switcher[^"']*["'][^>]*>([\s\S]*?)<\/details>/gi)) {
    const languageHrefs = [...match[1].matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)].map((item) => item[1]);
    const languageCode = (href) => href.match(/^\/(ar|en|ka|ru|az|fa)\//)?.[1] || (href.startsWith("/") ? "tr" : "");
    for (const expectedLanguage of ["ar", "en", "ka", "tr", "ru", "az", "fa"]) {
      const count = languageHrefs.filter((href) => languageCode(href) === expectedLanguage).length;
      if (count !== 1) errors.push(`${rel}: language menu must contain exactly one ${expectedLanguage} link`);
    }
  }
}

for (const relativePage of GENERATED_LANGUAGE_PAGES) {
  const enRel = `en/${relativePage}`;
  const arRel = `ar/${relativePage}`;
  const enHtml = fs.readFileSync(path.join(ROOT, enRel), "utf8");
  const arHtml = fs.readFileSync(path.join(ROOT, arRel), "utf8");
  if (!/data-translate=["']home["'][^>]*>\s*Home\s*</i.test(enHtml)) {
    errors.push(`${enRel}: English home navigation label was not preserved`);
  }
  if (!/data-translate=["']home["'][^>]*>\s*الصفحة الرئيسية\s*</i.test(arHtml)) {
    errors.push(`${arRel}: Arabic home navigation label was not preserved`);
  }
}

const seenTitles = new Set();
const seenDescriptions = new Set();
const georgianByUrl = new Map();
for (const [rel, canonical] of GEORGIAN_PAGES) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) {
    errors.push(`missing Georgian page: ${rel}`);
    continue;
  }
  let page;
  try {
    page = parsePage(file);
  } catch (error) {
    errors.push(`${rel}: invalid JSON-LD (${error.message})`);
    continue;
  }
  georgianByUrl.set(canonical, page);
  if (!page.title || seenTitles.has(page.title)) errors.push(`${rel}: missing or duplicate title`);
  if (!page.description || seenDescriptions.has(page.description)) errors.push(`${rel}: missing or duplicate meta description`);
  seenTitles.add(page.title);
  seenDescriptions.add(page.description);
  if (page.h1Count !== 1) errors.push(`${rel}: expected one H1, found ${page.h1Count}`);
  if (page.canonicals.length !== 1 || page.canonicals[0] !== canonical) errors.push(`${rel}: incorrect canonical`);
  if (!page.ogTitle || !page.ogDescription || page.ogUrl !== canonical) errors.push(`${rel}: incomplete Open Graph metadata`);
  if (!page.ogImage || page.twitterCard !== "summary_large_image" || !page.twitterTitle || !page.twitterDescription || !page.twitterImage) {
    errors.push(`${rel}: incomplete social sharing metadata`);
  }
  const types = collectTypes(page.jsonld);
  if (!types.has("Hotel")) errors.push(`${rel}: Hotel structured data missing`);
  if (rel !== "ka/index.html" && !types.has("BreadcrumbList")) {
    errors.push(`${rel}: BreadcrumbList structured data missing`);
  }
  if (!page.anchors.some((item) => item.href?.includes("pelit-park.rezervasyonal.com"))) errors.push(`${rel}: booking link missing`);
  if (!page.anchors.some((item) => item.href?.includes("wa.me/905521510012"))) errors.push(`${rel}: WhatsApp link missing`);
}

for (const url of [`${DOMAIN}/ka/batumi-trabzon/`]) {
  if (Object.keys(georgianByUrl.get(url)?.alternates || {}).length) {
    errors.push(`${url}: untranslated article must not advertise hreflang alternates`);
  }
}

// All real translations must advertise the same reciprocal group.
const { groups, alternates } = require("../tools/lib/site-languages");
for (const [key, group] of Object.entries(groups)) {
  const expected = alternates(group);
  for (const urlPath of Object.values(group)) {
    const rel = urlPath.slice(1) + "index.html";
    if (JSON.stringify(parsePage(path.join(ROOT, rel)).alternates) !== JSON.stringify(expected)) {
      errors.push(rel + ": " + key + " hreflang group is inconsistent");
    }
  }
}

const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const sitemapRows = new Map(
  [...sitemap.matchAll(/<url>\s*<loc>(.*?)<\/loc>\s*<lastmod>(.*?)<\/lastmod>/gs)].map((match) => [match[1], match[2]])
);
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
if (sitemapUrls.length !== new Set(sitemapUrls).size) errors.push("sitemap.xml contains duplicate URLs");
const localCanonicals = new Set(
  htmlFiles.flatMap((file) => {
    const page = parsePage(file);
    return page.canonicals.length === 1 && !/noindex/i.test(page.robots) ? page.canonicals : [];
  })
);
for (const sitemapUrl of sitemapUrls) {
  if (!localCanonicals.has(sitemapUrl)) errors.push(`sitemap URL has no matching local canonical: ${sitemapUrl}`);
}
for (const [canonical, expectedDate] of GEORGIAN_SITEMAP_DATES) {
  if (sitemapRows.get(canonical) !== expectedDate) errors.push(`sitemap missing current Georgian URL/date: ${canonical}`);
}

const georgianHomeLinks = new Set(georgianByUrl.get(`${DOMAIN}/ka/`)?.anchors.map((item) => item.href));
for (const canonical of [...GEORGIAN_PAGES.values()].slice(1)) {
  const pathname = new URL(canonical).pathname;
  if (!georgianHomeLinks.has(pathname)) errors.push(`ka/index.html: missing link to ${pathname}`);
}
for (const [canonical, page] of georgianByUrl) {
  if (canonical === `${DOMAIN}/ka/`) continue;
  if (!page.anchors.some((item) => item.href === "/ka/")) errors.push(`${canonical}: missing link back to Georgian home`);
}

const robots = fs.readFileSync(path.join(ROOT, "robots.txt"), "utf8");
if (!robots.includes("Allow: /") || !robots.includes(`Sitemap: ${DOMAIN}/sitemap.xml`)) {
  errors.push("robots.txt must allow crawling and advertise the sitemap");
}
const languageJs = fs.readFileSync(path.join(ROOT, "language.js"), "utf8");
if (languageJs.includes("createElement") || languageJs.includes("insertBefore")) {
  errors.push("language.js must not inject the Georgian language link");
}
const bookingEventsJs = fs.readFileSync(path.join(ROOT, "assets", "js", "booking-events.js"), "utf8");
if (/page_language:\s*["']ka["']|market:\s*["']georgia["']/.test(bookingEventsJs)) {
  errors.push("booking-events.js must derive the page language instead of hard-coding Georgian traffic");
}
if (!/conversion_stage:\s*["']outbound_click["']/.test(bookingEventsJs) ||
    !/booking_confirmed:\s*false/.test(bookingEventsJs)) {
  errors.push("booking-events.js must label outbound clicks separately from confirmed bookings");
}
const redirectJs = fs.readFileSync(path.join(ROOT, "assets/js/lang-redirect.js"), "utf8");
if (redirectJs.includes("updateGoogleRatingDisplay") || /replace\(\/4\\\.8\/g,\s*["']4\.9["']\)/.test(redirectJs)) {
  errors.push("lang-redirect.js must not rewrite a displayed review score");
}
const baseCss = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
if (!/img\s*\{[^}]*height:\s*auto\s*;/s.test(baseCss)) {
  errors.push("styles.css must keep responsive images at their intrinsic aspect ratio");
}
if (!/\.room__card__image\s*\{[^}]*aspect-ratio:\s*40\s*\/\s*29/s.test(baseCss) ||
    !/\.room__card__image img\s*\{[^}]*height:\s*100%[^}]*object-fit:\s*cover/s.test(baseCss)) {
  errors.push("styles.css must give every room-card image the verified 1600:1160 crop without distortion");
}
if (!/@media\s*\(max-width:\s*768px\)[\s\S]*?\.nav__bar\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto\s+auto/s.test(baseCss)) {
  errors.push("styles.css must keep the mobile header controls in a three-column grid");
}
if (!/\.nav__menu__btn\s*\{[^}]*flex:\s*0\s+0\s+44px[^}]*min-width:\s*44px/s.test(baseCss)) {
  errors.push("styles.css must prevent the mobile menu button from shrinking");
}
const mainJs = fs.readFileSync(path.join(ROOT, "main.js"), "utf8");
if (!/aria-expanded/.test(mainJs) || !/event\.key\s*===\s*["']Escape["']/.test(mainJs)) {
  errors.push("main.js must expose and close the mobile navigation accessibly");
}

if (errors.length) {
  console.error("Site validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Validated ${htmlFiles.length} HTML pages and ${GEORGIAN_PAGES.size} Georgian SEO pages.`);
