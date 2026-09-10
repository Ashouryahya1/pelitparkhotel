#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const BASE = "https://pelitparkhotel.com";
const BOOKING_ENGINE = "https://pelit-park.rezervasyonal.com/";
const WHATSAPP = "https://wa.me/905521510012";
const GOOGLE = "https://maps.app.goo.gl/AkTMb2R6jq4rDqtZ6";
const BOOKING_REVIEWS = "https://www.booking.com/hotel/tr/pelit-park.en-gb.html";

const pages = {
  tr: {
    dir: "ltr", locale: "tr_TR", path: "/reviews/", home: "/", rooms: "/room-types/", langName: "Türkçe",
    title: "Pelit Park Hotel Yorumları | Güncel Kaynaklar", desc: "Pelit Park Hotel hakkındaki güncel misafir yorumlarını ve puanları doğrudan Google Maps ve Booking.com kaynaklarında kontrol edin.",
    eyebrow: "Doğrulanabilir misafir geri bildirimi", h1: "Pelit Park Hotel Yorumları", lead: "Yorum sayıları ve puanlar zamanla değişir. Bu nedenle sabit bir puan veya inceleme sayısı yayımlamak yerine güncel kaynaklara doğrudan bağlantı veriyoruz.",
    sourceTitle: "Güncel yorumları kaynağında görün", google: "Google Maps yorumlarını aç", booking: "Booking.com sayfasını aç", note: "Harici platformlardaki içerik, puan ve sıralamalar ilgili platformlar tarafından güncellenir. Pelit Park Hotel bu değerleri bu sayfada çoğaltmaz veya değiştirmez.",
    updated: "Kaynak bağlantıları 10 Eylül 2026 tarihinde kontrol edildi.", roomLink: "Oda türlerini karşılaştır", book: "Güncel fiyatı kontrol et", contact: "İletişim", breadcrumb: "İçerik yolu", nav: "Gezinme",
  },
  en: {
    dir: "ltr", locale: "en_US", path: "/en/reviews/", home: "/en/", rooms: "/en/room-types/", langName: "English",
    title: "Pelit Park Hotel Reviews | Current Sources", desc: "Check current Pelit Park Hotel guest reviews and scores directly on Google Maps and Booking.com instead of relying on a copied, outdated rating.",
    eyebrow: "Verifiable guest feedback", h1: "Pelit Park Hotel Reviews", lead: "Review totals and scores change over time. Instead of publishing a fixed rating or count, this page links directly to the current sources.",
    sourceTitle: "Read current reviews at the source", google: "Open Google Maps reviews", booking: "Open the Booking.com listing", note: "Content, scores and rankings on external platforms are updated by those platforms. Pelit Park Hotel does not reproduce or alter those values on this page.",
    updated: "Source links checked on September 10, 2026.", roomLink: "Compare room types", book: "Check current rate", contact: "Contact", breadcrumb: "Breadcrumb", nav: "Navigation",
  },
  ar: {
    dir: "rtl", locale: "ar_AR", path: "/ar/reviews/", home: "/ar/", rooms: "/ar/room-types/", langName: "العربية",
    title: "تقييمات Pelit Park Hotel | المصادر الحالية", desc: "اطّلع على تقييمات نزلاء Pelit Park Hotel ودرجاتهم الحالية مباشرة في Google Maps وBooking.com بدل الاعتماد على رقم منسوخ قديم.",
    eyebrow: "آراء نزلاء قابلة للتحقق", h1: "تقييمات Pelit Park Hotel", lead: "يتغير عدد المراجعات والدرجات مع الوقت. لذلك نربط بالمصادر الحالية مباشرة بدل نشر تقييم أو عدد ثابت غير مؤرخ.",
    sourceTitle: "اقرأ التقييمات الحالية في مصدرها", google: "افتح تقييمات Google Maps", booking: "افتح صفحة Booking.com", note: "تُحدّث المنصات الخارجية محتواها ودرجاتها وترتيبها بنفسها. لا ينسخ Pelit Park Hotel هذه القيم أو يغيرها في هذه الصفحة.",
    updated: "تم التحقق من روابط المصادر في 10 سبتمبر 2026.", roomLink: "قارن أنواع الغرف", book: "تحقق من السعر الحالي", contact: "التواصل", breadcrumb: "مسار الصفحة", nav: "التنقل",
  },
};

const e = (value) => String(value).replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
const languagePaths = { tr: "/reviews/", en: "/en/reviews/", ar: "/ar/reviews/", ka: "/ka/" };
const hreflangs = { tr: "tr-TR", en: "en", ar: "ar" };

function html(lang, page) {
  const canonical = `${BASE}${page.path}`;
  const alternatives = ["tr", "en", "ar"].map((code) => `<link rel="alternate" hreflang="${hreflangs[code]}" href="${BASE}${languagePaths[code]}" />`).join("\n    ");
  const switcher = [["ar", "AR", "العربية"], ["en", "EN", "English"], ["ka", "KA", "ქართული"], ["tr", "TR", "Türkçe"]].map(([code, label, name]) => `<a href="${languagePaths[code]}" aria-label="${name}"${code === lang ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "Hotel", "@id": `${BASE}/#hotel`, name: "Pelit Park Hotel", url: `${BASE}/`, image: `${BASE}/assets/about.webp`, telephone: "+90 552 151 00 12", email: "info@pelitparkhotel.com", address: { "@type": "PostalAddress", streetAddress: "Üniversite Mh. Akif Saruhan Cd. No:77/1", addressLocality: "Ortahisar", addressRegion: "Trabzon", addressCountry: "TR" }, hasMap: GOOGLE }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: lang === "ar" ? "الرئيسية" : lang === "en" ? "Home" : "Ana Sayfa", item: `${BASE}${page.home}` }, { "@type": "ListItem", position: 2, name: page.h1, item: canonical }] }] };
  const rtl = lang === "ar" ? '<link rel="stylesheet" href="/assets/css/rtl.css" />' : "";
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${page.dir}"><head>
  <!-- Google tag (gtag.js) --><script async src="https://www.googletagmanager.com/gtag/js?id=AW-18172085628"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","AW-18172085628");</script>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${e(page.desc)}" /><meta name="robots" content="index,follow" /><link rel="canonical" href="${canonical}" />
  ${alternatives}
  <link rel="alternate" hreflang="x-default" href="${BASE}/reviews/" />
  <meta property="og:title" content="${e(page.title)}" /><meta property="og:description" content="${e(page.desc)}" /><meta property="og:url" content="${canonical}" /><meta property="og:type" content="website" /><meta property="og:site_name" content="Pelit Park Hotel" /><meta property="og:image" content="${BASE}/assets/about.webp" /><meta property="og:locale" content="${page.locale}" />
  <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${e(page.title)}" /><meta name="twitter:description" content="${e(page.desc)}" /><meta name="twitter:image" content="${BASE}/assets/about.webp" />
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" rel="stylesheet" /><link rel="stylesheet" href="/styles.css" /><link rel="stylesheet" href="/assets/css/georgian-landing.css" />${rtl}<title>${e(page.title)}</title>
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" /><link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" /><link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" /><link rel="manifest" href="/assets/site.webmanifest" />
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head><body class="georgian-page georgian-content-page">
  <header class="subpage__header roomtypes__header georgian-hero georgian-subpage-hero"><nav><div class="nav__bar"><div class="logo"><a href="${page.home}"><img src="/assets/logo.png" alt="Pelit Park Hotel" width="637" height="392" /></a></div><ul class="nav__links" id="nav-links"><li><a href="${page.home}">${lang === "ar" ? "الرئيسية" : lang === "en" ? "Home" : "Ana Sayfa"}</a></li><li><a href="${page.rooms}">${page.roomLink}</a></li><li><a href="${page.path}" aria-current="page">${page.h1}</a></li><li><a href="#contact">${page.contact}</a></li></ul><div class="language-switcher" aria-label="${page.nav}">${switcher}</div><div class="nav__menu__btn" id="menu-btn"><i class="ri-menu-line"></i></div></div></nav><nav class="georgian-breadcrumb" aria-label="${page.breadcrumb}"><ol><li><a href="${page.home}">${lang === "ar" ? "الرئيسية" : lang === "en" ? "Home" : "Ana Sayfa"}</a></li><li aria-current="page">${page.h1}</li></ol></nav><div class="section__container georgian-hero__content"><p class="section__subheader">${page.eyebrow}</p><h1 class="section__header">${page.h1}</h1><p class="section__description">${page.lead}</p></div></header>
  <main><section class="section__container georgian-intro"><h2 class="section__header">${page.sourceTitle}</h2><p class="section__description">${page.note}</p><div class="georgian-info-grid"><article class="georgian-info-card"><i class="ri-google-fill" aria-hidden="true"></i><h3>Google Maps</h3><p>${page.google}</p><a href="${GOOGLE}" target="_blank" rel="noopener noreferrer">${page.google}</a></article><article class="georgian-info-card"><i class="ri-hotel-line" aria-hidden="true"></i><h3>Booking.com</h3><p>${page.booking}</p><a href="${BOOKING_REVIEWS}" target="_blank" rel="noopener noreferrer">${page.booking}</a></article><article class="georgian-info-card"><i class="ri-calendar-check-line" aria-hidden="true"></i><h3>${page.updated}</h3><p>${page.lead}</p></article></div></section><section class="georgian-final-cta"><h2 class="section__header">${page.book}</h2><p class="section__description">${page.note}</p><div class="georgian-section__actions"><a class="btn" href="${BOOKING_ENGINE}" target="_blank" rel="noopener noreferrer" data-booking-event="booking_click">${page.book}</a><a class="btn georgian-btn--dark" href="${WHATSAPP}" target="_blank" rel="noopener noreferrer" data-booking-event="whatsapp_click">WhatsApp</a><a class="georgian-text-link" href="${page.rooms}">${page.roomLink}</a></div></section></main>
  <footer class="footer" id="contact"><div class="section__container footer__container"><div class="footer__col"><div class="logo"><a href="${page.home}">Pelit Park Hotel</a></div><p class="section__description">${page.note}</p></div><div class="footer__col"><h4>${page.contact}</h4><ul class="footer__links"><li><a href="mailto:info@pelitparkhotel.com">info@pelitparkhotel.com</a></li><li><a href="tel:+905521510012">+90 552 151 00 12</a></li><li>Üniversite Mh. Akif Saruhan Cd. No:77/1 Ortahisar / Trabzon</li></ul></div></div><div class="footer__bar">© 2026 Pelit Park Hotel</div></footer>
  <div class="georgian-mobile-bar" role="navigation" aria-label="${page.book}"><a class="georgian-mobile-bar__button georgian-mobile-bar__button--primary" href="${WHATSAPP}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a class="georgian-mobile-bar__button" href="${BOOKING_ENGINE}" target="_blank" rel="noopener noreferrer">${page.book}</a></div><script src="/main.js"></script><script src="/language.js"></script><script src="/assets/js/booking-events.js"></script>
</body></html>`;
}

for (const [lang, page] of Object.entries(pages)) {
  const target = path.join(ROOT, page.path.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html(lang, page), "utf8");
  console.log(`Built ${path.relative(ROOT, target)}`);
}
