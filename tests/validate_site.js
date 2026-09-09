const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DOMAIN = "https://pelitparkhotel.com";
const GEORGIAN_PAGES = new Map([
  ["ka/index.html", `${DOMAIN}/ka/`],
  ["ka/hotel-near-forum-trabzon/index.html", `${DOMAIN}/ka/hotel-near-forum-trabzon/`],
  ["ka/hotel-near-farabi-hospital/index.html", `${DOMAIN}/ka/hotel-near-farabi-hospital/`],
  ["ka/batumi-trabzon/index.html", `${DOMAIN}/ka/batumi-trabzon/`],
  ["ka/room-types/index.html", `${DOMAIN}/ka/room-types/`],
]);
const GENERATED_LANGUAGE_PAGES = [
  "index.html",
  "about/index.html",
  "explore/index.html",
  "reviews/index.html",
  "room-types/index.html",
  "services/Consulting-Service/index.html",
  "services/airport-transfers/index.html",
  "services/flexible-booking/index.html",
  "travel-tips/index.html",
];
const SITEMAP_LASTMOD = "2026-09-09";

const errors = [];

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
  for (const anchor of page.anchors) {
    if (!localTargetExists(anchor.href, file)) errors.push(`${rel}: broken local link ${anchor.href}`);
  }
  for (const image of page.images) {
    if (!localTargetExists(image.src, file)) errors.push(`${rel}: missing image ${image.src}`);
  }
  for (const match of page.html.matchAll(/<div[^>]+class=["'][^"']*language-switcher[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi)) {
    const languageHrefs = [...match[1].matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)].map((item) => item[1]);
    for (const expectedHref of ["/ar/", "/en/", "/ka/", "/"]) {
      const count = languageHrefs.filter((href) => href === expectedHref).length;
      if (count !== 1) errors.push(`${rel}: language menu must contain exactly one ${expectedHref} link`);
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
  if (rel !== "ka/index.html" && (!types.has("BreadcrumbList") || !page.hasBreadcrumb)) {
    errors.push(`${rel}: BreadcrumbList or visible breadcrumb missing`);
  }
  if (!page.anchors.some((item) => item.href?.includes("pelit-park.rezervasyonal.com"))) errors.push(`${rel}: booking link missing`);
  if (!page.anchors.some((item) => item.href?.includes("wa.me/905521510012"))) errors.push(`${rel}: WhatsApp link missing`);
}

for (const url of [
  `${DOMAIN}/ka/hotel-near-forum-trabzon/`,
  `${DOMAIN}/ka/hotel-near-farabi-hospital/`,
  `${DOMAIN}/ka/batumi-trabzon/`,
]) {
  if (Object.keys(georgianByUrl.get(url)?.alternates || {}).length) {
    errors.push(`${url}: untranslated article must not advertise hreflang alternates`);
  }
}

const roomGroup = {
  "tr-TR": `${DOMAIN}/room-types/`,
  en: `${DOMAIN}/en/room-types/`,
  ar: `${DOMAIN}/ar/room-types/`,
  "ka-GE": `${DOMAIN}/ka/room-types/`,
  "x-default": `${DOMAIN}/room-types/`,
};
const homeGroup = {
  "tr-TR": `${DOMAIN}/`,
  en: `${DOMAIN}/en/`,
  ar: `${DOMAIN}/ar/`,
  "ka-GE": `${DOMAIN}/ka/`,
  "x-default": `${DOMAIN}/`,
};
for (const rel of ["index.html", "en/index.html", "ar/index.html", "ka/index.html"]) {
  if (JSON.stringify(parsePage(path.join(ROOT, rel)).alternates) !== JSON.stringify(homeGroup)) {
    errors.push(`${rel}: home-page hreflang group is inconsistent`);
  }
}
for (const rel of ["room-types/index.html", "en/room-types/index.html", "ar/room-types/index.html", "ka/room-types/index.html"]) {
  if (JSON.stringify(parsePage(path.join(ROOT, rel)).alternates) !== JSON.stringify(roomGroup)) {
    errors.push(`${rel}: room-type hreflang group is inconsistent`);
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
for (const canonical of GEORGIAN_PAGES.values()) {
  if (sitemapRows.get(canonical) !== SITEMAP_LASTMOD) errors.push(`sitemap missing current Georgian URL/date: ${canonical}`);
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
const redirectJs = fs.readFileSync(path.join(ROOT, "assets/js/lang-redirect.js"), "utf8");
if (redirectJs.includes("updateGoogleRatingDisplay") || /replace\(\/4\\\.8\/g,\s*["']4\.9["']\)/.test(redirectJs)) {
  errors.push("lang-redirect.js must not rewrite a displayed review score");
}

if (errors.length) {
  console.error("Site validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Validated ${htmlFiles.length} HTML pages and ${GEORGIAN_PAGES.size} Georgian SEO pages.`);
