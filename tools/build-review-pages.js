#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const BASE = "https://pelitparkhotel.com";
const BOOKING_ENGINE = "https://pelit-park.rezervasyonal.com/";
const WHATSAPP = "https://wa.me/905521510012";
const GOOGLE = "https://maps.app.goo.gl/AkTMb2R6jq4rDqtZ6";
const BOOKING_REVIEWS = "https://www.booking.com/hotel/tr/pelit-park.en-gb.html";

const selections = require("../data/review-selections.json");
const pages = {
  tr: {
    dir: "ltr", locale: "tr_TR", path: "/reviews/", home: "/", rooms: "/room-types/",
    title: "Pelit Park Hotel Misafir Yorumları | Trabzon", desc: "Pelit Park Hotel misafirlerinin Google ve Booking.com'da paylaştığı konaklama deneyimlerini okuyun. Trabzon'daki konaklamanız için odalarımızı keşfedin.",
    eyebrow: "MİSAFİR YORUMLARI", h1: "Misafirlerimizin gözünden Pelit Park Hotel", lead: "Bir konaklamadan geriye kalan güzel anılar. Misafirlerimizin Trabzon'da bizimle geçirdikleri günlere göz atın.",
    sourceTitle: "Misafirlerimiz neler diyor?", selected: "Misafir yorumlarından seçmeler", google: "Google'daki tüm yorumlar", booking: "Booking.com'daki tüm yorumlar", rating: "Misafir değerlendirme puanı",
    roomLink: "Odalarımızı keşfedin", book: "Rezervasyon yap", contact: "İletişim", breadcrumb: "İçerik yolu", nav: "Gezinme", cta: "Sizi de ağırlamaktan mutluluk duyarız.",
  },
  en: {
    dir: "ltr", locale: "en_US", path: "/en/reviews/", home: "/en/", rooms: "/en/room-types/",
    title: "Pelit Park Hotel Guest Reviews | Trabzon", desc: "Read selected Google and Booking.com reviews from Pelit Park Hotel guests and explore our rooms for your stay in Trabzon.",
    eyebrow: "GUEST REVIEWS", h1: "Pelit Park Hotel through our guests’ eyes", lead: "The memories that make a stay special. Discover what our guests have shared about their time with us in Trabzon.",
    sourceTitle: "What our guests say", selected: "Selected guest reviews", google: "All reviews on Google", booking: "All reviews on Booking.com", rating: "Guest review score",
    roomLink: "Explore our rooms", book: "Book your stay", contact: "Contact", breadcrumb: "Breadcrumb", nav: "Navigation", cta: "We look forward to welcoming you.",
  },
  ar: {
    dir: "rtl", locale: "ar_AR", path: "/ar/reviews/", home: "/ar/", rooms: "/ar/room-types/",
    title: "آراء ضيوف فندق بيليت بارك | طرابزون", desc: "اقرأ تجارب ضيوف فندق بيليت بارك المنشورة على Google وBooking.com، وتعرّف على غرفنا لإقامتك في طرابزون.",
    eyebrow: "آراء ضيوفنا", h1: "بيليت بارك بعيون ضيوفنا", lead: "ذكريات جميلة تبدأ بإقامة مريحة. اكتشف ما شاركه ضيوفنا عن أيامهم معنا في طرابزون.",
    sourceTitle: "ماذا يقول ضيوفنا؟", selected: "مختارات من آراء الضيوف", google: "كل التقييمات على Google", booking: "كل التقييمات على Booking.com", rating: "تقييم الضيوف",
    roomLink: "اكتشف غرفنا", book: "احجز إقامتك", contact: "تواصل معنا", breadcrumb: "مسار الصفحة", nav: "التنقل", cta: "نتطلع لاستضافتك وصنع ذكريات جميلة معك.",
  },
};

const e = (value) => String(value).replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
const languagePaths = { tr: "/reviews/", en: "/en/reviews/", ar: "/ar/reviews/", ka: "/ka/" };
const hreflangs = { tr: "tr-TR", en: "en", ar: "ar" };

// Read the localized homepage footer so review pages cannot drift into a
// separate two-column layout. Assets must resolve from nested review URLs.
function sharedFooter(page) {
  const homeFile = path.join(ROOT, page.home, "index.html");
  const source = fs.readFileSync(homeFile, "utf8");
  const footer = source.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0];
  if (!footer) throw new Error(`Homepage footer missing: ${homeFile}`);
  return footer.replace(/(src=["'])(?:\.\.\/|\.\/)*assets\//g, "$1/assets/").replace(/\r\n/g, "\n");
}

function reviewGroup(lang, page, platform) {
  const name = platform === "booking" ? "Booking.com" : "Google";
  const url = platform === "booking" ? BOOKING_REVIEWS : GOOGLE;
  const cards = selections.locales[lang][platform].map((review) => {
    if (!review.quoteHtml || !review.author || !review.details) {
      throw new Error(`Incomplete ${platform} review in ${lang}`);
    }
    // Only line breaks are allowed in historical quotations; keep all words.
    const quote = e(review.quoteHtml).replace(/&lt;br\s*\/?&gt;/gi, "<br />");
    return `<article class="guest-review" data-review-author="${e(review.author)}">
      <blockquote class="review__quote">${quote}</blockquote>
      <div class="review__meta"><span class="review__author">${e(review.author)}</span><span class="review__details">${e(review.details)}</span></div>
      <a class="guest-review__source" href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>
    </article>`;
  }).join("\n");
  return `<section class="section__container guest-reviews__group" id="${platform}-reviews" aria-labelledby="${platform}-heading">
    <div class="guest-reviews__heading"><div><h2 class="section__header" id="${platform}-heading">${name}</h2><p class="section__description">${page.selected}</p></div>
    ${platform === "booking" ? `<div class="guest-reviews__score"><strong dir="ltr">${selections.bookingScore}<small> / ${selections.bookingScale}</small></strong><span>${page.rating}</span></div>` : ""}</div>
    <div class="guest-reviews__cards">${cards}</div>
    <a class="guest-reviews__all" href="${url}" target="_blank" rel="noopener noreferrer">${page[platform]} <i class="ri-external-link-line" aria-hidden="true"></i></a>
  </section>`;
}

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
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" rel="stylesheet" /><link rel="stylesheet" href="/styles.css" /><link rel="stylesheet" href="/assets/css/georgian-landing.css" /><link rel="stylesheet" href="/assets/css/reviews.css" />${rtl}<title>${e(page.title)}</title>
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" /><link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" /><link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" /><link rel="manifest" href="/assets/site.webmanifest" />
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head><body class="georgian-page georgian-content-page guest-reviews-page">
  <header class="subpage__header roomtypes__header georgian-hero georgian-subpage-hero"><nav><div class="nav__bar"><div class="logo"><a href="${page.home}"><img src="/assets/logo.png" alt="Pelit Park Hotel" width="637" height="392" /></a></div><ul class="nav__links" id="nav-links"><li><a href="${page.home}">${lang === "ar" ? "الرئيسية" : lang === "en" ? "Home" : "Ana Sayfa"}</a></li><li><a href="${page.rooms}">${page.roomLink}</a></li><li><a href="${page.path}" aria-current="page">${lang === "ar" ? "التقييمات" : lang === "en" ? "Reviews" : "Yorumlar"}</a></li><li><a href="#contact">${page.contact}</a></li></ul><div class="language-switcher" aria-label="${page.nav}">${switcher}</div><div class="nav__menu__btn" id="menu-btn"><i class="ri-menu-line"></i></div></div></nav><div class="section__container georgian-hero__content"><p class="section__subheader">${page.eyebrow}</p><h1 class="section__header">${page.h1}</h1><p class="section__description">${page.lead}</p></div></header>
  <main>
    <nav class="georgian-breadcrumb" aria-label="${page.breadcrumb}"><ol><li><a href="${page.home}">${lang === "ar" ? "الرئيسية" : lang === "en" ? "Home" : "Ana Sayfa"}</a></li><li aria-current="page">${page.h1}</li></ol></nav>
    <section class="section__container guest-reviews__intro"><h2 class="section__header">${page.sourceTitle}</h2><div class="reviews__nav"><a class="reviews__nav-link" href="#booking-reviews">Booking.com <b dir="ltr">${selections.bookingScore} / ${selections.bookingScale}</b></a><a class="reviews__nav-link" href="#google-reviews"><i class="ri-google-fill" aria-hidden="true"></i> Google</a></div></section>
    ${reviewGroup(lang, page, "booking")}
    ${reviewGroup(lang, page, "google")}
    <section class="georgian-final-cta"><h2 class="section__header">${page.cta}</h2><div class="georgian-section__actions"><a class="btn" href="${BOOKING_ENGINE}" target="_blank" rel="noopener noreferrer" data-booking-event="booking_click">${page.book}</a><a class="btn georgian-btn--dark" href="${WHATSAPP}" target="_blank" rel="noopener noreferrer" data-booking-event="whatsapp_click">WhatsApp</a><a class="georgian-text-link" href="${page.rooms}">${page.roomLink}</a></div></section>
  </main>
  ${sharedFooter(page)}
  <div class="georgian-mobile-bar" role="navigation" aria-label="${page.book}"><a class="georgian-mobile-bar__button georgian-mobile-bar__button--primary" href="${WHATSAPP}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a class="georgian-mobile-bar__button" href="${BOOKING_ENGINE}" target="_blank" rel="noopener noreferrer">${page.book}</a></div><script src="/main.js"></script><script src="/language.js"></script><script src="/assets/js/booking-events.js"></script>
</body></html>`;
}

for (const [lang, page] of Object.entries(pages)) {
  const target = path.join(ROOT, page.path.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html(lang, page), "utf8");
  console.log(`Built ${path.relative(ROOT, target)}`);
}
