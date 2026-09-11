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
};
const slugs = {
  home: "", about: "about/", rooms: "room-types/", reviews: "reviews/",
  airport: "hotel-near-trabzon-airport/", forum: "hotel-near-forum-trabzon/", farabi: "hotel-near-farabi-hospital/",
};
const turkish = { airport: "trabzon-havalimanina-yakin-otel/", forum: "forum-trabzon-yakin-otel/", farabi: "farabi-hastanesi-yakin-otel/" };
const groups = Object.fromEntries(Object.entries(slugs).map(([key, slug]) => [key,
  Object.fromEntries(Object.entries(languages).filter(([lang]) => lang !== "ka" || !["about", "reviews"].includes(key))
    .map(([lang, info]) => [lang, `${info.home}${lang === "tr" ? turkish[key] || slug : slug}`]))
]));
const languageForPath = (urlPath) => urlPath.match(/^\/(en|ar|ka|ru|az)(?:\/|$)/)?.[1] || "tr";
const groupForPath = (urlPath) => Object.entries(groups).find(([, group]) => Object.values(group).includes(urlPath));
function availableGroup(group) {
  return Object.entries(group).filter(([, urlPath]) => fs.existsSync(path.join(ROOT, urlPath, "index.html")));
}
function alternates(group) {
  const entries = availableGroup(group).map(([lang, urlPath]) => [languages[lang].hreflang, `${BASE}${urlPath}`]);
  if (entries.length > 1) entries.push(["x-default", `${BASE}${group.tr}`]);
  return Object.fromEntries(entries);
}
module.exports = { ROOT, BASE, languages, slugs, groups, languageForPath, groupForPath, alternates };

