const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { ROOT, BASE, languages, languageForPath, groupForPath, alternates } = require("./lib/site-languages");
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
    if ([".git", "node_modules", ".codex-tmp"].includes(entry.name)) return [];
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}
const versions = Object.fromEntries(["styles.css", "main.js", "language.js", "assets/js/lang-redirect.js", "assets/js/booking-events.js"].map(file => [
  file, crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT,file))).digest("hex").slice(0,12)
]));
let count = 0;
for (const file of walk(ROOT).filter(file => file.endsWith(".html"))) {
  let html = fs.readFileSync(file,"utf8");
  if (!html.includes("language-switcher")) continue;
  const before = html;
  const urlPath = "/" + path.relative(ROOT,file).replaceAll(path.sep,"/").replace(/index\.html$/,"");
  const active = languageForPath(urlPath);
  const match = groupForPath(urlPath);
  if (match) {
    // Replace only head alternate links, never the visible page copy.
    const alternateMarkup = Object.entries(alternates(match[1])).map(([code, url]) =>
      `<link rel="alternate" hreflang="${code}" href="${url}" />`).join("\n  ");
    html = html.replace(/<head\b[^>]*>[\s\S]*?<\/head>/i, head =>
      head.replace(/[ \t]*<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhreflang=)[^>]*>[ \t]*\r?\n?/gi,"")
        .replace(/<\/head>/i, `  ${alternateMarkup}\n</head>`));
  }
  html = html.replace(/(<div\b[^>]*class=["'][^"']*\blanguage-switcher\b[^"']*["'][^>]*>)([\s\S]*?)(<\/div>)/gi, (_,open,body,close) => {
    const existing = {};
    for (const anchor of body.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/g)) {
      if (anchor[1].startsWith("/")) existing[languageForPath(anchor[1])] = anchor[1];
    }
    const buttons = Object.entries(languages).map(([code, info]) => {
      const href = match?.[1][code] || existing[code] || info.home;
      const current = code === active ? ' class="is-active" aria-current="page"' : "";
      return `<a href="${escapeHtml(href)}" lang="${code}" hreflang="${info.hreflang}" aria-label="${info.name}" title="${info.name}"${current}>${code.toUpperCase()}</a>`;
    }).join("");
    return `${open}${buttons}${close}`;
  });
  html = html.replace(/\b(href|src)=(["'])([^"']+)\2/g, (full,attr,quote,value) => {
    if (/^(https?:|\/\/|#)/.test(value)) return full;
    const clean = value.split("?")[0];
    const asset = clean.startsWith("/") ? clean.slice(1) : path.relative(ROOT,path.resolve(path.dirname(file),clean)).replaceAll(path.sep,"/");
    return versions[asset] ? `${attr}=${quote}/${asset}?v=${versions[asset]}${quote}` : full;
  });
  if (before !== html) { fs.writeFileSync(file,html); count++; }
}
console.log(`Normalized six-language navigation and reciprocal hreflang on ${count} pages.`);

