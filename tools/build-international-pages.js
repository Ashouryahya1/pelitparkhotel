const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { ROOT, BASE, languages, slugs, groups, alternates } = require("./lib/site-languages");
const facts = require("../data/hotel-facts.json");
const { languageSelector } = require("./lib/language-selector");
const selections = require("../data/review-selections.json");
const stats = require("../data/home-stats.json");
const e = value => String(value).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const asset = file => `/${file}?v=${crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT,file))).digest("hex").slice(0,12)}`;
const places = {
  airport: { destination:"Trabzon Airport", official:"https://www.dhmi.gov.tr/Sayfalar/Havalimani/Trabzon/Ulasim.aspx" },
  forum: { destination:"Forum Trabzon", official:"https://www.forumtrabzon.com/" },
  farabi: { destination:"KTU Farabi Hospital, Trabzon", official:"https://www.ktu.edu.tr/farabi/iletisim" },
};
const bookingReviews = "https://www.booking.com/hotel/tr/pelit-park.en-gb.html";
const image = (file,alt) => `<img src="/assets/${file}" alt="${e(alt)}" width="1600" height="1160" loading="lazy" decoding="async" />`;
const external = (href,label,classes="",event="") => `<a href="${e(href)}" class="${classes}" target="_blank" rel="noopener noreferrer"${event ? ` data-booking-event="${event}"` : ""}>${e(label)}</a>`;
const paragraphs = values => values.map(p => `<p class="section__description">${e(p)}</p>`).join("\n");
function actions(d, hero=false) {
  return `<div class="${hero?"georgian-hero__actions":"georgian-section__actions"}">
    ${external(facts.booking.engineUrl,d.labels.book,"btn","booking_click")}
    ${external(facts.booking.whatsappUrl,"WhatsApp","btn georgian-btn--dark","whatsapp_click")}
  </div>`;
}
function header(d,key) {
  const l=d.labels,lang=d.language,home=groups.home[lang];
  const nav = [["home",home],["about",groups.about[lang]],["rooms",groups.rooms[lang]],["reviews",groups.reviews[lang]],["location",home+"#location-pages"],["contact","#contact"]]
    .map(([label,url])=>`<li><a href="${url}"${key===label?' aria-current="page"':""}>${e(l[label])}</a></li>`).join("");
  const switcher = languageSelector(lang,groups[key]);
  const homeHero = `<p>${e(d.home.welcome)}</p><h1>${e(d.seo.home[2])}</h1><h2>${e(d.home.slogan)}</h2>${actions(d,true)}`;
  const lead = key==="home" ? d.home.aboutText : key==="about" ? d.about.paragraphs[0] : key==="rooms" ? d.roomIntro : key==="reviews" ? d.reviewsLead : d.locations[key].lead;
  const subHero = `<p class="section__subheader">${e(d.locations[key]?.eyebrow || (key==="about"?l.about:key==="rooms"?l.rooms:l.reviews))}</p><h1 class="section__header">${e(d.seo[key][2])}</h1><p class="section__description">${e(lead)}</p>${actions(d,true)}`;
  return `<header class="${key==="home"?"header":"subpage__header roomtypes__header georgian-hero georgian-subpage-hero"}">
  <nav><div class="nav__bar"><div class="logo"><a href="${home}"><img src="/assets/logo.png" alt="Pelit Park Hotel" width="637" height="392" /></a></div>
    <ul class="nav__links" id="nav-links">${nav}</ul>
    ${switcher}
    <div class="nav__menu__btn" id="menu-btn" role="button" tabindex="0" aria-label="${e(l.menu)}" aria-controls="nav-links" aria-expanded="false"><i class="ri-menu-line" aria-hidden="true"></i></div>
  </div></nav><div class="section__container ${key==="home"?"header__container":"georgian-hero__content"}" id="home">${key==="home"?homeHero:subHero}</div></header>`;
}
function footer(d) {
  const l=d.labels,lang=d.language,a=facts.identity.address;
  const links=keys=>keys.map(key=>`<li><a href="${groups[key][lang]}">${e(l[key])}</a></li>`).join("");
  return `<footer class="footer" id="contact"><div class="section__container footer__container">
    <div class="footer__col"><a href="${groups.home[lang]}" class="footer__brand">Pelit Park Hotel</a><p class="section__description">${e(l.footerText)}</p>${external(facts.booking.engineUrl,l.book,"btn","booking_click")}</div>
    <div class="footer__col"><h4>${e(l.footerLinks)}</h4><ul class="footer__links">${links(["home","about","rooms","reviews"])}</ul></div>
    <div class="footer__col"><h4>${e(l.footerLocation)}</h4><ul class="footer__links">${links(["airport","forum","farabi"])}</ul></div>
    <div class="footer__col"><h4>${e(l.contact)}</h4><ul class="footer__links">
      <li><a href="mailto:${facts.identity.email}">${facts.identity.email}</a></li>
      <li><a href="tel:+905521510012" dir="ltr">${facts.identity.telephone}</a></li>
      <li>${external(facts.identity.mapUrl,`${a.streetAddress}, ${a.addressLocality} / ${a.addressRegion}`,"","directions_click")}</li>
      <li>${external(facts.identity.instagramUrl,"Instagram")}</li></ul></div>
  </div><div class="footer__bar">© ${new Date().getUTCFullYear()} Pelit Park Hotel. ${e(l.rights)}.</div></footer>`;
}
function cards(d) {
  return `<div class="room__grid">${d.rooms.map((room,i)=>`<article class="room__card" id="room-${i+1}">
    <div class="room__card__image">${image(`room-${i+1}.webp`,room.title+" · Pelit Park Hotel")}</div>
    <div class="room__card__details"><h3>${e(room.title)}</h3><p>${e(room.description)}</p>
    <ul class="room__amenities">${room.features.map(f=>`<li>${e(f)}</li>`).join("")}</ul>
    ${external(facts.booking.engineUrl,d.labels.book,"btn","booking_click")}</div></article>`).join("")}</div>`;
}
function faq(d,items) {
  return `<section class="section__container georgian-faq"><h2 class="section__header">${e(d.labels.questions)}</h2><div class="international-faq">${items.map(([q,a])=>`<details><summary>${e(q)}</summary><p>${e(a)}</p></details>`).join("")}</div></section>`;
}
function locations(d,exclude) {
  return `<section class="section__container seo-location-links" id="location-pages"><h2 class="section__header">${e(exclude?d.labels.related:d.home.locationTitle)}</h2><p class="section__description">${e(d.home.locationIntro)}</p><div class="goals__grid">
    ${["airport","forum","farabi"].filter(key=>key!==exclude).map(key=>`<a class="goal__card location-page-link" href="${groups[key][d.language]}"><h3>${e(d.labels[key])}</h3><p>${e(d.locations[key].lead)}</p><span class="location-card__cta">${e(d.labels.readMore)} →</span></a>`).join("")}
  </div></section>`;
}
function home(d) {
  return `<section class="section__container about__container" id="about"><div class="about__image">${image("about.webp",d.home.aboutTitle)}</div>
    <div class="about__content"><p class="section__subheader">${e(d.labels.about)}</p><h2 class="section__header">${e(d.home.aboutTitle)}</h2><p class="section__description">${e(d.home.aboutText)}</p><div class="about__btn"><a href="${groups.about[d.language]}" class="btn">${e(d.labels.readMore)}</a></div></div></section>
    <section class="section__container room__container"><p class="section__subheader">${e(d.home.roomEyebrow)}</p><h2 class="section__header">${e(d.home.roomTitle)}</h2>${cards(d)}<p class="international-more"><a href="${groups.rooms[d.language]}">${e(d.labels.checkRooms)} →</a></p></section>
    <section class="section__container banner__container" id="guest-stats" aria-label="${e(d.labels.stats)}"><div class="banner__content">
      ${[[stats.bookingRating,d.labels.bookingRating],[stats.googleRating,d.labels.googleRating],[stats.completedBookings,d.labels.completedBookings]].map(([value,label])=>`<div class="banner__card"><h4 dir="ltr">${value}</h4><p>${e(label)}</p></div>`).join("")}
    </div></section>
    ${locations(d)}
    <section class="section__container"><h2 class="section__header">${e(d.home.servicesTitle)}</h2><div class="international-features">${d.home.services.map(([icon,title,description])=>`<article class="goal__card"><i class="${icon} georgian-card__icon" aria-hidden="true"></i><h3>${e(title)}</h3><p>${e(description)}</p></article>`).join("")}</div></section>
    ${faq(d,d.home.faq)}`;
}
function about(d) {
  return `<section class="section__container about__container"><div class="about__image">${image("about.webp",d.seo.about[2])}</div><div class="about__content"><h2 class="section__header">${e(d.about.introTitle)}</h2>${paragraphs(d.about.paragraphs)}</div></section>
    <section class="section__container"><div class="goals__grid">${d.about.values.map(([title,p])=>`<article class="goal__card"><h2>${e(title)}</h2><p>${e(p)}</p></article>`).join("")}</div></section>${locations(d)}`;
}
function reviews(d) {
  return ["booking","google"].map(platform=>{
    const platformName=platform==="booking"?"Booking.com":"Google",url=platform==="booking"?bookingReviews:facts.identity.mapUrl;
    return `<section class="section__container guest-reviews__group" id="${platform}-reviews">
      <div class="guest-reviews__heading"><div><h2 class="section__header">${platformName}</h2><p class="section__description">${e(d.labels.translated)}</p></div>${platform==="booking"?`<div class="guest-reviews__score"><strong dir="ltr">${selections.bookingScore}<small> / ${selections.bookingScale}</small></strong><span>${e(d.labels.bookingScore)}</span></div>`:""}</div>
      <div class="guest-reviews__cards">${selections.locales.en[platform].map((source,i)=>{
        const [quote,details]=d.reviewTranslations[platform][i];
        return `<article class="guest-review" data-review-author="${e(source.author)}"><blockquote class="review__quote">${e(quote).replace(/\n/g,"<br />")}</blockquote><div class="review__meta"><span class="review__author">${e(source.author)}</span><span class="review__details">${e(details)}</span></div>${external(url,platformName,"guest-review__source")}</article>`;
      }).join("")}</div>${external(url,`${d.labels.allReviews} · ${platformName}`,"guest-reviews__all")}</section>`;
  }).join("");
}
function place(d,key) {
  const p=d.locations[key],place=places[key];
  const route=`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent("Pelit Park Hotel, Trabzon")}&destination=${encodeURIComponent(place.destination)}&travelmode=driving`;
  return `<section class="section__container international-prose"><h2 class="section__header">${e(p.introTitle)}</h2>${paragraphs(p.paragraphs)}<div class="georgian-section__actions">${external(route,d.labels.route,"btn","directions_click")}${external(place.official,d.labels.official,"georgian-text-link")}</div></section>
    <section class="section__container"><div class="goals__grid">${p.tips.map(([title,text])=>`<article class="goal__card"><h2>${e(title)}</h2><p>${e(text)}</p></article>`).join("")}</div></section>
    <section class="section__container room__container"><h2 class="section__header">${e(d.home.roomTitle)}</h2><p class="section__description">${e(d.roomIntro)}</p><a href="${groups.rooms[d.language]}" class="btn">${e(d.labels.checkRooms)}</a></section>
    ${faq(d,p.faq)}${locations(d,key)}`;
}
function html(d,key) {
  const canonical=BASE+groups[key][d.language],[title,description]=d.seo[key];
  const schema={"@context":"https://schema.org","@graph":[
    {"@type":"Hotel","@id":BASE+"/#hotel",name:facts.identity.name,url:facts.identity.canonicalUrl,image:BASE+"/assets/about.webp",telephone:facts.identity.telephone,email:facts.identity.email,hasMap:facts.identity.mapUrl,address:{"@type":"PostalAddress",...facts.identity.address}},
    {"@type":"WebPage","@id":canonical+"#webpage",url:canonical,name:title,description,inLanguage:d.language,about:{"@id":BASE+"/#hotel"}}
  ]};
  if(key!=="home") schema["@graph"].push({"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:d.labels.home,item:BASE+groups.home[d.language]},{"@type":"ListItem",position:2,name:d.seo[key][2],item:canonical}]});
  const content=key==="home"?home(d):key==="about"?about(d):key==="rooms"?`<section class="section__container room__container"><h2 class="section__header">${e(d.home.roomTitle)}</h2>${cards(d)}</section>${faq(d,d.roomFaq)}${locations(d)}`:key==="reviews"?reviews(d):place(d,key);
  return `<!DOCTYPE html>
<html lang="${d.language}" dir="${d.language==="fa"?"rtl":"ltr"}"><head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${e(title)}</title><meta name="description" content="${e(description)}" /><meta name="robots" content="index,follow" /><link rel="canonical" href="${canonical}" />
  ${Object.entries(alternates(groups[key])).map(([code,url])=>`<link rel="alternate" hreflang="${code}" href="${url}" />`).join("\n  ")}
  <meta property="og:type" content="website" /><meta property="og:site_name" content="Pelit Park Hotel" /><meta property="og:title" content="${e(title)}" /><meta property="og:description" content="${e(description)}" /><meta property="og:url" content="${canonical}" /><meta property="og:locale" content="${d.locale}" /><meta property="og:image" content="${BASE}/assets/about.webp" /><meta property="og:image:alt" content="${e(d.home.aboutTitle)}" />
  <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${e(title)}" /><meta name="twitter:description" content="${e(description)}" /><meta name="twitter:image" content="${BASE}/assets/about.webp" /><meta name="twitter:image:alt" content="${e(d.home.aboutTitle)}" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" /><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" /><link rel="manifest" href="/assets/site.webmanifest" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" />
  <link rel="stylesheet" href="${asset("styles.css")}" /><link rel="stylesheet" href="${asset("assets/css/georgian-landing.css")}" />${key==="reviews"?`<link rel="stylesheet" href="${asset("assets/css/reviews.css")}" />`:""}
  <link rel="stylesheet" href="${asset("assets/css/international-pages.css")}" /><link rel="preload" as="image" href="/assets/room-1.webp" />
  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g,"\\u003c")}</script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18172085628"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","AW-18172085628");</script>
</head><body class="international-page georgian-page${key==="home"?"":" georgian-content-page"}${key==="reviews"?" guest-reviews-page":""}">
  ${header(d,key)}<main>${content}
    <section class="georgian-final-cta"><h2 class="section__header">${e(d.labels.checkRooms)}</h2>${actions(d)}</section>
  </main>${footer(d)}
  <div class="georgian-mobile-bar" role="navigation" aria-label="${e(d.labels.quickBooking)}">${external(facts.booking.whatsappUrl,"WhatsApp","georgian-mobile-bar__button georgian-mobile-bar__button--primary","whatsapp_click")}${external(facts.booking.engineUrl,d.labels.book,"georgian-mobile-bar__button","booking_click")}</div>
  <script src="/main.js"></script><script src="/language.js"></script><script src="/assets/js/booking-events.js"></script>
</body></html>
`;
}
for(const lang of ["ru","az","fa"]) {
  const data=JSON.parse(fs.readFileSync(path.join(ROOT,`data/locales/${lang}.json`),"utf8"));
  for(const key of Object.keys(slugs)) {
    const file=path.join(ROOT,groups[key][lang],"index.html");
    fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,html(data,key),"utf8");
    console.log(`Built ${path.relative(ROOT,file)}`);
  }
}
