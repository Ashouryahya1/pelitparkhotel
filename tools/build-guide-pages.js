const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {ROOT,BASE,languages,groups,guideGroups,languageForPath}=require("./lib/site-languages");
const {languageSelector}=require("./lib/language-selector");
const catalog=require("../data/guide-catalog.json");
const facts=require("../data/hotel-facts.json");
const packs=Object.fromEntries(Object.keys(languages).map(lang=>[lang,require(`../data/guides/${lang}.json`)]));
const e=value=>String(value).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const asset=file=>`/${file}?v=${crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT,file))).digest("hex").slice(0,12)}`;
const guidePath=(lang,id="index")=>guideGroups["guide:"+id][lang];
const locales={tr:"tr_TR",en:"en_GB",ar:"ar",ka:"ka_GE",ru:"ru_RU",az:"az_AZ",fa:"fa_IR"};
const menuLabels={tr:"Gezinme menüsünü aç",en:"Open navigation menu",ar:"فتح قائمة التنقل",ka:"ნავიგაციის მენიუს გახსნა",ru:"Открыть меню навигации",az:"Naviqasiya menyusunu açın",fa:"باز کردن منوی پیمایش"};
const external=(url,label,event)=>`<a class="btn" href="${e(url)}" target="_blank" rel="noopener noreferrer" data-booking-event="${event}">${e(label)}</a>`;
function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    if([".git","node_modules",".codex-tmp"].includes(entry.name))return [];
    const file=path.join(dir,entry.name);
    return entry.isDirectory()?walk(file):[file];
  });
}
function write(file,html){
  // Keep untouched legacy CRLF lines; added lines use LF consistently.
  html=html.split('\n').map(line=>/TRABZON_GUIDES_|data-guide-(?:footer|css)/.test(line)?line.replace(/\r$/, ''):line).join('\n');
  fs.mkdirSync(path.dirname(file),{recursive:true});
  if(!fs.existsSync(file)||fs.readFileSync(file,"utf8")!==html)fs.writeFileSync(file,html);
}
function cards(lang,ids,heading="h2"){
  const d=packs[lang];
  return `<div class="guide-cards">${ids.map(id=>{
    const a=d.articles[id];
    return `<article class="guide-card"><${heading}><a href="${guidePath(lang,id)}">${e(a.title)}</a></${heading}><p>${e(a.description)}</p><a class="guide-read" href="${guidePath(lang,id)}">${e(d.labels.read)}<span aria-hidden="true"> ↗</span></a></article>`;
  }).join("\n")}</div>`;
}
function homeSection(lang){
  const l=packs[lang].labels;
  return `<!-- TRABZON_GUIDES_START --><section class="section__container home-guides" id="travel-guides" aria-labelledby="home-guides-title"><p class="guide-eyebrow">Pelit Park Hotel · Trabzon</p><h2 class="section__header" id="home-guides-title">${e(l.homeTitle)}</h2><p class="section__description">${e(l.homeIntro)}</p>${cards(lang,["where-to-stay","family-stays","hotel-prices"],"h3")}<a class="btn guide-all" href="${guidePath(lang)}">${e(l.all)}</a></section><!-- TRABZON_GUIDES_END -->`;
}
// Postprocess after the old locale builders. This removes any copied TR discovery
// text from EN/AR and replaces only our marked additions, never existing prose.
for(const file of walk(ROOT).filter(file=>file.endsWith(".html"))){
  const rel="/"+path.relative(ROOT,file).replaceAll(path.sep,"/").replace(/index\.html$/,"");
  if(/\/guides\//.test(rel))continue;
  let html=fs.readFileSync(file,"utf8");
  if(!/<footer\b/.test(html)||/<meta\b[^>]*content=["'][^"']*noindex/i.test(html))continue;
  const lang=languageForPath(rel),l=packs[lang].labels;
  html=html.replace(/<!-- TRABZON_GUIDES_START -->[\s\S]*?<!-- TRABZON_GUIDES_END -->/g,"");
  html=html.replace(/<li data-guide-footer>[\s\S]*?<\/li>/g,"");
  html=html.replace(/<link data-guide-css[^>]*>/g,"");
  html=html.replace(/<footer\b[\s\S]*?<\/footer>/,footer=>footer.replace(/(<ul\b[^>]*class="footer__links"[^>]*>)/,`$1<li data-guide-footer><a href="${guidePath(lang)}">${e(l.guides)}</a></li>`));
  if(rel===languages[lang].home){
    const block=homeSection(lang);
    html=html.includes("</main>")?html.replace("</main>",block+"</main>"):html.replace(/<footer\b/,block+"<footer");
    html=html.replace("</head>",`<link data-guide-css rel="stylesheet" href="${asset("assets/css/guides.css")}" /></head>`);
  }
  write(file,html);
}
const footers=Object.fromEntries(Object.entries(languages).map(([lang,info])=>{
  const home=fs.readFileSync(path.join(ROOT,info.home,"index.html"),"utf8");
  const footer=home.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
  if(!footer)throw new Error("Missing localized footer for "+lang);
  const portable=footer.replace(/\r\n/g,'\n').replace(/\b(src|href)=(["'])((?!\/|https?:|#|mailto:|tel:)[^"']+)\2/g,(_,attr,q,value)=>{
    const url=new URL(value,BASE+info.home);
    return `${attr}=${q}${url.pathname}${url.search}${url.hash}${q}`;
  });
  return [lang,portable];
}));
function header(lang,id){
  const l=packs[lang].labels;
  const links=[[l.home,groups.home[lang]],[l.rooms,groups.rooms[lang]],[l.guides,guidePath(lang)],[l.contact,"#contact"]];
  return `<header class="guide-header"><nav aria-label="${e(l.guides)}"><div class="nav__bar"><div class="logo"><a href="${groups.home[lang]}"><img src="/assets/logo.png" alt="Pelit Park Hotel" width="637" height="392" /></a></div><ul class="nav__links" id="nav-links">${links.map(([label,url])=>`<li><a href="${url}"${id==="index"&&url===guidePath(lang)?' aria-current="page"':""}>${e(label)}</a></li>`).join("")}</ul>${languageSelector(lang,guideGroups["guide:"+id])}<div class="nav__menu__btn" id="menu-btn" role="button" tabindex="0" aria-label="${e(menuLabels[lang])}" aria-controls="nav-links" aria-expanded="false"><i class="ri-menu-line" aria-hidden="true"></i></div></div></nav></header>`;
}
function shell(lang,id,title,description,content,topic){
  const l=packs[lang].labels,canonical=BASE+guidePath(lang,id),img=topic?.image||"about.webp",imageUrl=BASE+"/assets/"+img;
  const graph=[
    {"@type":"Hotel","@id":BASE+"/#hotel",name:facts.identity.name,url:facts.identity.canonicalUrl,image:BASE+"/assets/about.webp",telephone:facts.identity.telephone,email:facts.identity.email,hasMap:facts.identity.mapUrl,address:{"@type":"PostalAddress",...facts.identity.address}},
    {"@type":id==="index"?"CollectionPage":"WebPage","@id":canonical+"#webpage",url:canonical,name:title,description,inLanguage:lang,isPartOf:{"@id":BASE+"/#website"},about:{"@id":BASE+"/#hotel"}},
    {"@type":"WebSite","@id":BASE+"/#website",name:"Pelit Park Hotel",url:BASE+"/"}
  ];
  if(topic){
    graph.push({"@type":"Article","@id":canonical+"#article",headline:title,description,inLanguage:lang,url:canonical,mainEntityOfPage:{"@id":canonical+"#webpage"},image:imageUrl,datePublished:catalog.publishedAt,dateModified:catalog.updatedAt,author:{"@id":BASE+"/#hotel"},publisher:{"@id":BASE+"/#hotel"}});
  }else{
    graph.push({"@type":"ItemList",itemListElement:catalog.topics.map((t,i)=>({"@type":"ListItem",position:i+1,name:packs[lang].articles[t.id].title,url:BASE+guidePath(lang,t.id)}))});
  }
  const alternateTags=Object.entries(guideGroups["guide:"+id]).map(([code,url])=>`<link rel="alternate" hreflang="${languages[code].hreflang}" href="${BASE}${url}" />`).join("\n");
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${["ar","fa"].includes(lang)?"rtl":"ltr"}"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${e(title)} | Pelit Park Hotel</title><meta name="description" content="${e(description)}" /><meta name="robots" content="index,follow" />
<link rel="canonical" href="${canonical}" />${alternateTags}<link rel="alternate" hreflang="x-default" href="${BASE}${guidePath("tr",id)}" />
<meta property="og:type" content="${topic?"article":"website"}" /><meta property="og:title" content="${e(title)}" /><meta property="og:description" content="${e(description)}" /><meta property="og:url" content="${canonical}" /><meta property="og:site_name" content="Pelit Park Hotel" /><meta property="og:locale" content="${locales[lang]}" /><meta property="og:image" content="${imageUrl}" /><meta property="og:image:alt" content="${e(l.imageAlt)}" />
${topic?`<meta property="article:published_time" content="${catalog.publishedAt}" /><meta property="article:modified_time" content="${catalog.updatedAt}" />`:""}
<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${e(title)}" /><meta name="twitter:description" content="${e(description)}" /><meta name="twitter:image" content="${imageUrl}" /><meta name="twitter:image:alt" content="${e(l.imageAlt)}" />
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" /><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" /><link rel="manifest" href="/assets/site.webmanifest" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" /><link rel="stylesheet" href="${asset("styles.css")}" /><link rel="stylesheet" href="${asset("assets/css/guides.css")}" />
<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@graph":graph}).replace(/</g,"\\u003c")}</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18172085628"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","AW-18172085628");</script>
</head><body class="guide-page">
${header(lang,id)}<main id="main-content">${content}</main>${footers[lang]}
<script src="/main.js"></script><script src="/language.js"></script><script src="/assets/js/booking-events.js"></script>
</body></html>\n`;
}
function article(lang,topic){
  const {labels:l,articles}=packs[lang],a=articles[topic.id];
  const date=new Intl.DateTimeFormat(lang==="fa"?"fa-IR-u-ca-gregory":lang,{dateStyle:"long",timeZone:"UTC"}).format(new Date(catalog.updatedAt+"T00:00:00Z"));
  const toc=`<aside class="guide-toc"><h2>${e(l.contents)}</h2><ol>${a.sections.map(([heading],i)=>`<li><a href="#section-${i+1}">${e(heading)}</a></li>`).join("")}</ol></aside>`;
  const sections=a.sections.map(([heading,p],i)=>`<section class="guide-section" id="section-${i+1}"><h2>${e(heading)}</h2><p>${e(p)}</p></section>`).join("\n");
  const content=`<article class="guide-article"><div class="guide-heading"><p class="guide-eyebrow">Pelit Park Hotel · Trabzon</p><h1>${e(a.title)}</h1><p class="guide-intro">${e(a.intro)}</p><p class="guide-meta">${e(l.author)} <a href="${groups.about[lang]||groups.home[lang]}">Pelit Park Hotel</a> · ${e(l.updated)} <time datetime="${catalog.updatedAt}">${e(date)}</time></p></div>
<figure class="guide-photo"><img src="/assets/${topic.image}" alt="${e(l.imageAlt)}" width="1600" height="1160" decoding="async" /><figcaption>Pelit Park Hotel · Trabzon</figcaption></figure>
<div class="guide-prose">${toc}${sections}
<section class="guide-checklist"><h2>${e(l.checklist)}</h2><ul>${a.checklist.map(item=>`<li>${e(item)}</li>`).join("")}</ul></section>
<section class="guide-faq"><h2>${e(l.faq)}</h2>${a.faq.map(([q,answer])=>`<details><summary>${e(q)}</summary><p>${e(answer)}</p></details>`).join("")}</section>
${topic.sources.length?`<section class="guide-sources"><h2>${e(l.sources)}</h2><ul>${topic.sources.map(s=>`<li><a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.name)}</a></li>`).join("")}</ul></section>`:""}
<section class="guide-stay"><h2>${e(l.hotel)}</h2><p><a href="${groups[topic.hotelPage][lang]}">${e(topic.hotelPage==="rooms"?l.rooms:l.hotelLink)}</a></p><div class="guide-actions">${external(facts.booking.engineUrl,l.book,"booking_click")}${external(facts.booking.whatsappUrl,"WhatsApp","whatsapp_click")}</div></section>
</div></article><section class="section__container guide-related"><h2>${e(l.related)}</h2>${cards(lang,topic.related,"h3")}<a class="guide-all guide-read" href="${guidePath(lang)}">${e(l.all)}</a></section>`;
  return shell(lang,topic.id,a.title,a.description,content,topic);
}
for(const lang of Object.keys(languages)){
  const d=packs[lang],ids=catalog.topics.map(t=>t.id);
  if(JSON.stringify(Object.keys(d.articles))!==JSON.stringify(ids))throw new Error("Incomplete or reordered article pack: "+lang);
  const index=`<section class="section__container guide-index"><p class="guide-eyebrow">Pelit Park Hotel · Trabzon</p><h1>${e(d.labels.indexTitle)}</h1><p class="guide-intro">${e(d.labels.intro)}</p>${cards(lang,ids)}</section>`;
  write(path.join(ROOT,guidePath(lang),"index.html"),shell(lang,"index",d.labels.indexTitle,d.labels.indexDescription,index));
  for(const topic of catalog.topics)write(path.join(ROOT,guidePath(lang,topic.id),"index.html"),article(lang,topic));
}
const urls=Object.values(guideGroups).flatMap(group=>Object.values(group).map(url=>BASE+url)).sort();
write(path.join(ROOT,"sitemap-guides.xml"),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url=>`  <url><loc>${e(url)}</loc><lastmod>${catalog.updatedAt}</lastmod></url>`).join("\n")}\n</urlset>\n`);
write(path.join(ROOT,"docs/guide-indexing-urls.txt"),urls.join("\n")+"\n");
console.log(`Built ${catalog.topics.length*Object.keys(languages).length} localized articles, seven indexes, shared footer discovery and sitemap-guides.xml.`);
