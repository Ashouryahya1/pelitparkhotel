#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_LANGS = ['en', 'ar'];
const BASE_URL = 'https://pelitparkhotel.com';
const MANUAL_PAGE_DIRS = new Set([
  'reviews/', // Owned by build-review-pages.js in each locale.
  'trabzon-havalimanina-yakin-otel/',
  'forum-trabzon-yakin-otel/',
  'farabi-hastanesi-yakin-otel/',
]);
const TRANSLATIONS = loadTranslations();

function loadTranslations() {
  const dir = path.join(ROOT, 'translations');
  const translations = {};
  for (const lang of ['tr', 'en', 'ar']) {
    const file = path.join(dir, `${lang}.json`);
    translations[lang] = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return translations;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

function getTranslation(lang, key) {
  const parts = key.split('.');
  let current = TRANSLATIONS[lang];
  for (const part of parts) {
    if (current && Object.prototype.hasOwnProperty.call(current, part)) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

function collectPages() {
  const pages = [];
  const skipDirs = new Set(['en', 'ar', 'ka', 'translations', 'tools', 'node_modules', '.git']);

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const hasIndex = entries.some((entry) => entry.isFile() && entry.name === 'index.html');
    if (hasIndex) {
      const relativePage = path.relative(ROOT, path.join(dir, 'index.html'));
      const normalizedDir = normalizePath(path.dirname(relativePage));
      if (!MANUAL_PAGE_DIRS.has(normalizedDir)) pages.push(relativePage);
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (skipDirs.has(entry.name) || entry.name.startsWith('.')) continue;
      walk(path.join(dir, entry.name));
    }
  }

  walk(ROOT);
  return pages;
}

function normalizePath(dirPath) {
  if (!dirPath || dirPath === '.') return '';
  const normalized = dirPath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  return normalized ? `${normalized}/` : '';
}

function applyTranslations(html, lang) {
  const keys = new Set();
  const dataTranslateRegex = /data-translate="([^"]+)"/g;
  let match;
  while ((match = dataTranslateRegex.exec(html))) {
    keys.add(match[1]);
  }

  for (const key of keys) {
    const translation = getTranslation(lang, key);
    if (!translation) continue;
    const escapedKey = escapeRegExp(key);

    const inputRegex = new RegExp(`(<(input|textarea)[^>]*data-translate=\"${escapedKey}\"[^>]*)(\\/?>)`, 'gi');
    html = html.replace(inputRegex, (full, start, tag, end) => {
      if (/placeholder=\"[^\"]*\"/i.test(start)) {
        start = start.replace(/placeholder=\"[^\"]*\"/i, `placeholder=\"${translation}\"`);
      } else {
        start = `${start} placeholder=\"${translation}\"`;
      }
      return `${start}${end}`;
    });

    const elementRegex = new RegExp(`<([a-zA-Z0-9]+)([^>]*)data-translate=\"${escapedKey}\"([^>]*)>([\\s\\S]*?)<\\/\\1>`, 'gi');
    html = html.replace(elementRegex, (full, tag, beforeAttrs, afterAttrs, body) => {
      const opening = `<${tag}${beforeAttrs}data-translate=\"${key}\"${afterAttrs}>`;
      return `${opening}${translation}</${tag}>`;
    });
  }

  return html;
}

function updateLangAttributes(html, lang) {
  html = html.replace(/<html\s+[^>]*lang=\"[^\"]*\"/i, (match) => {
    const dirAttr = lang === 'ar' ? ' dir="rtl"' : ' dir="ltr"';
    if (/dir=\"[^\"]*\"/i.test(match)) {
      return match.replace(/dir=\"[^\"]*\"/i, `lang=\"${lang}\"${dirAttr}`);
    }
    return match.replace(/lang=\"[^\"]*\"/i, `lang=\"${lang}\"${dirAttr}`);
  });
  return html;
}

function setSeo(html, lang, pageKey) {
  const title = getTranslation(lang, `seo.title.${pageKey}`);
  const description = getTranslation(lang, `seo.desc.${pageKey}`);

  if (title) {
    const titleRegex = /<title>[\s\S]*?<\/title>/i;
    if (titleRegex.test(html)) {
      html = html.replace(titleRegex, `<title>${title}</title>`);
    } else {
      html = html.replace(/<head>/i, `<head>\n    <title>${title}</title>`);
    }
  }

  if (description) {
    const metaRegex = /<meta[^>]*name=\"description\"[^>]*>/i;
    if (metaRegex.test(html)) {
      html = html.replace(metaRegex, `<meta name="description" content="${description}" />`);
    } else {
      html = html.replace(/<head>/i, `<head>\n    <meta name="description" content="${description}" />`);
    }
  }

  return html;
}

function normalizeUrl(url) {
  return url.replace(/([^:]\/)(\/+)/g, '$1/');
}

function setCanonicalAndHreflang(html, pagePath, lang) {
  const pathPart = normalizePath(pagePath);
  const canonical = normalizeUrl(`${BASE_URL}${lang === 'tr' ? '' : `/${lang}`}/${pathPart}`);

  const canonicalRegex = /<link[^>]*rel=\"canonical\"[^>]*>/i;
  if (canonicalRegex.test(html)) {
    html = html.replace(canonicalRegex, `<link rel="canonical" href="${canonical}" />`);
  } else {
    html = html.replace(/<head>/i, `<head>\n    <link rel="canonical" href="${canonical}" />`);
  }

  // Remove existing hreflang tags to avoid duplicates
  html = html.replace(/^[\t ]*<link[^>]*rel=\"alternate\"[^>]*>[\t ]*\r?\n?/gim, '');

  const altLinks = [
    { lang: 'tr-TR', href: normalizeUrl(`${BASE_URL}/${pathPart}`) },
    { lang: 'en', href: normalizeUrl(`${BASE_URL}/en/${pathPart}`) },
    { lang: 'ar', href: normalizeUrl(`${BASE_URL}/ar/${pathPart}`) },
    { lang: 'x-default', href: normalizeUrl(`${BASE_URL}/${pathPart}`) },
  ];

  if (!pathPart || pathPart === 'room-types/') {
    altLinks.splice(3, 0, { lang: 'ka-GE', href: `${BASE_URL}/ka/` });
    if (pathPart === 'room-types/') {
      altLinks[3].href = `${BASE_URL}/ka/room-types/`;
    }
  }

  const hreflangMarkup = altLinks
    .map(({ lang: hrefLang, href }) => `    <link rel="alternate" hreflang="${hrefLang}" href="${href}" />`)
    .join('\n');

  html = html.replace(/<\/head>/i, `${hreflangMarkup}\n  </head>`);
  return html;
}

function ensureGeorgianLanguageLink(html) {
  return html.replace(
    /<div\s+[^>]*class=["'][^"']*language-switcher[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
    (switcher) => {
      if (/<a\s+[^>]*href=["']\/ka\/["'][^>]*>/i.test(switcher)) return switcher;
      return switcher.replace(
        /(<a\s+[^>]*href=["']\/["'][^>]*>\s*TR\s*<\/a>)/i,
        '<a href="/ka/" aria-label="ქართული">KA</a>$1'
      );
    }
  );
}

function normalizeAirportGuideLabels(html) {
  return html
    .replace(/>Airport Transfers</g, '>Airport Arrival Guide<')
    .replace(/>Havalimanı Transferleri</g, '>Havalimanı Ulaşım Rehberi<')
    .replace(/>خدمة نقل المطار</g, '>دليل الوصول من المطار<');
}

function localizeLinks(html, lang, pageDir) {
  if (lang === 'tr') return { html, protectedSwitchers: [] };
  const langPrefix = `/${lang}`;
  const targetPages = ['about', 'explore', 'room-types', 'travel-tips', 'reviews'];
  const protectedSwitchers = [];

  html = html.replace(
    /<div\s+[^>]*class=["'][^"']*language-switcher[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
    (switcher) => {
      const token = `__LANGUAGE_SWITCHER_${protectedSwitchers.length}__`;
      protectedSwitchers.push(switcher);
      return token;
    }
  );

  const anchorRegex = /<a\s+([^>]*?)href=(\"|\')([^\"\']+)(\2)([^>]*)>/gi;
  html = html.replace(anchorRegex, (full, before, quote, href, _quote, after) => {
    const newHref = rewriteHref(href, langPrefix, targetPages);
    const trimmedBefore = before.trim();
    const prefix = trimmedBefore ? `${trimmedBefore} ` : '';
    const suffix = after || '';
    return `<a ${prefix}href=${quote}${newHref}${quote}${suffix}>`;
  });
  return { html, protectedSwitchers };
}

function rewriteHref(href, prefix, targetPages) {
  if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || href.startsWith('javascript:')) {
    return href;
  }
  if (href.startsWith('/assets') || href.startsWith('/styles.css') || href.startsWith('/main.js') || href.startsWith('/translations')) {
    return href;
  }

  const [pathPart, hashPart] = href.split('#');
  const [pathWithoutQuery, queryPart] = pathPart.split('?');
  let updatedPath = pathWithoutQuery;

  const serviceMatch = pathWithoutQuery.match(/^\/services\/([^/]+)\/?$/i);
  if (serviceMatch) {
    updatedPath = `${prefix}/services/${serviceMatch[1].replace(/\/$/, '')}/`;
  } else if (pathWithoutQuery === '/' || pathWithoutQuery === '') {
    updatedPath = `${prefix}/`;
  } else {
    const matchedPage = targetPages.find((page) => pathWithoutQuery.toLowerCase().startsWith(`/${page}`));
    if (matchedPage) {
      const remainder = pathWithoutQuery.slice(matchedPage.length + 1);
      const trailing = remainder.endsWith('/') || remainder === '' ? '' : '/';
      updatedPath = `${prefix}/${matchedPage}${remainder}${trailing || (remainder ? '' : '/')}`;
    }
  }

  // Preserve query
  if (queryPart) {
    updatedPath += `?${queryPart}`;
  }
  if (hashPart && hashPart !== '') {
    updatedPath += `#${hashPart}`;
  }
  return normalizeUrl(updatedPath);
}

function ensureRtlStyles(html, lang) {
  if (lang !== 'ar') return html;
  const rtlLink = '<link rel="stylesheet" href="/assets/css/rtl.css" />';
  if (html.includes(rtlLink)) return html;
  return html.replace(/<\/head>/i, `  ${rtlLink}\n  </head>`);
}

function normalizeAssetPaths(html, protectedSwitchers = []) {
  html = html.replace(/\b(src|href)=(["'])(?:\.\/)?assets\//gi, '$1=$2/assets/');
  html = html.replace(
    /\b(src|href)=(["'])(?:\.\/)?(styles\.css|main\.js|language\.js)(["'])/gi,
    '$1=$2/$3$4'
  );
  return html.replace(/__LANGUAGE_SWITCHER_(\d+)__/g, (_match, index) => protectedSwitchers[Number(index)]);
}

function lockLanguage(html, lang) {
  if (lang === 'tr') return html;
  const forcedUserLang = /let userLang = [^;]+;/;
  const savedLangLookup = /const savedLang = localStorage.getItem\("lang"\);/g;

  html = html.replace(forcedUserLang, `let userLang = '${lang}';`);
  html = html.replace(savedLangLookup, `const savedLang = '${lang}';`);
  return html;
}

function ensureOutputDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function getPageKey(pagePath) {
  const directory = normalizePath(path.dirname(pagePath));
  const map = {
    '': 'home',
    'about/': 'about',
    'explore/': 'explore',
    'room-types/': 'rooms',
    'reviews/': 'reviews',
    'travel-tips/': 'travel_tips',
    'services/airport-transfers/': 'airport_transfers',
    'services/flexible-booking/': 'flexible_booking',
    'services/Consulting-Service/': 'consulting_service',
  };
  return map[directory] || 'home';
}

function buildPage(page) {
  const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  const pageDir = path.dirname(page);
  const normalizedDir = normalizePath(pageDir);
  const pageKey = getPageKey(page);

  const turkishPath = path.join(ROOT, page);
  const turkishWithHreflang = normalizeAirportGuideLabels(ensureGeorgianLanguageLink(
    setCanonicalAndHreflang(html, normalizedDir, 'tr')
  ));
  if (turkishWithHreflang !== html) {
    fs.writeFileSync(turkishPath, turkishWithHreflang, 'utf8');
  }

  for (const lang of OUTPUT_LANGS) {
    const outputPath = path.join(ROOT, lang, normalizedDir, 'index.html');

    if (!/data-translate=["'][^"']+["']/i.test(html)) {
      if (!fs.existsSync(outputPath)) {
        throw new Error(`Cannot build ${lang}/${normalizedDir || ''}index.html: Turkish source has no translation markers and no localized page exists.`);
      }

      let localized = fs.readFileSync(outputPath, 'utf8');
      localized = setCanonicalAndHreflang(localized, normalizedDir, lang);
      localized = ensureRtlStyles(localized, lang);
      localized = ensureGeorgianLanguageLink(localized);
      localized = normalizeAirportGuideLabels(localized);
      localized = normalizeAssetPaths(localized);
      fs.writeFileSync(outputPath, localized, 'utf8');
      console.log(`Updated ${lang}/${normalizedDir || ''}index.html (preserved localized content)`);
      continue;
    }

    let localized = html;
    localized = updateLangAttributes(localized, lang);
    localized = applyTranslations(localized, lang);
    localized = setSeo(localized, lang, pageKey);
    localized = setCanonicalAndHreflang(localized, normalizedDir, lang);
    localized = ensureRtlStyles(localized, lang);
    localized = lockLanguage(localized, lang);
    const localizedLinks = localizeLinks(localized, lang, normalizedDir);
    localized = localizedLinks.html;
    localized = ensureGeorgianLanguageLink(localized);
    localized = normalizeAirportGuideLabels(localized);
    localized = normalizeAssetPaths(localized, localizedLinks.protectedSwitchers);

    ensureOutputDir(outputPath);
    fs.writeFileSync(outputPath, localized, 'utf8');
    console.log(`Built ${lang}/${normalizedDir || ''}index.html`);
  }
}

function main() {
  const pages = collectPages();
  pages.forEach(buildPage);
}

main();
