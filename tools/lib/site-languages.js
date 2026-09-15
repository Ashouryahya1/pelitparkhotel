const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "../..");
const BASE = "https://pelitparkhotel.com";
const languages = {
  tr: { name: "Türkçe", hreflang: "tr-TR", home: "/" },
  en: { name: "English", hreflang: "en", home: "/en/" },
  ar: { name: "العربية", hreflang: "ar", home: "/ar/" },
  ka: { name: "ქართული", hreflang: "ka-GE", home: "/ka/" },
  ru: { name: "Русский", hreflang: "ru", home: "/ru/" },
  az: { name: "Azərbaycanca", hreflang: "az", home: "/az/" },
  fa: { name: "فارسی", hreflang: "fa", home: "/fa/" },
};
const slugs = {
  home: "", about: "about/", rooms: "room-types/", reviews: "reviews/",
  airport: "hotel-near-trabzon-airport/", forum: "hotel-near-forum-trabzon/", farabi: "hotel-near-farabi-hospital/",
};
// German currently has one complete landing page, not translated guides or subpages.
const landingLanguages = { de: { name: "Deutsch", hreflang: "de", home: "/de/" } };
const navigationLanguages = { ...languages, ...landingLanguages };
const turkish = { airport: "trabzon-havalimanina-yakin-otel/", forum: "forum-trabzon-yakin-otel/", farabi: "farabi-hastanesi-yakin-otel/" };
const groups = Object.fromEntries(Object.entries(slugs).map(([key, slug]) => [key,
  Object.fromEntries(Object.entries(languages).filter(([lang]) => lang !== "ka" || !["about", "reviews"].includes(key))
    .map(([lang, info]) => [lang, `${info.home}${lang === "tr" ? turkish[key] || slug : slug}`]))
]));
groups.home.de = "/de/";
const languageForPath = (urlPath) => urlPath.match(/^\/(en|ar|ka|ru|az|fa|de)(?:\/|$)/)?.[1] || "tr";
// Editorial routes are separate from slugs: the core page generator owns only slugs.
const guideCatalog = require('../../data/guide-catalog.json');
const guideGroups = Object.fromEntries([['index', ''], ...guideCatalog.topics.map(t => [t.id, t.slug + '/'])]
  .map(([id, slug]) => ['guide:' + id, Object.fromEntries(Object.entries(languages)
    .map(([lang, info]) => [lang, `${info.home}guides/${slug}`]))]));
const groupForPath = (urlPath) => Object.entries({...groups, ...guideGroups}).find(([, group]) => Object.values(group).includes(urlPath));
function availableGroup(group) {
  return Object.entries(group).filter(([, urlPath]) => fs.existsSync(path.join(ROOT, urlPath, "index.html")));
}
function alternates(group) {
  const entries = availableGroup(group).map(([lang, urlPath]) => [navigationLanguages[lang].hreflang, `${BASE}${urlPath}`]);
  if (entries.length > 1) entries.push(["x-default", `${BASE}${group.tr}`]);
  return Object.fromEntries(entries);
}
module.exports = { ROOT, BASE, languages, navigationLanguages, slugs, groups, guideGroups, languageForPath, groupForPath, alternates };
