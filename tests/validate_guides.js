const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {ROOT,BASE,languages,guideGroups,groups}=require("../tools/lib/site-languages");
const catalog=require("../data/guide-catalog.json");
const read=urlPath=>fs.readFileSync(path.join(ROOT,urlPath,"index.html"),"utf8");
const attr=(tag,key)=>tag.match(new RegExp(`\\b${key}=["']([^"']*)["']`))?.[1];
const footer=html=>html.match(/<footer\b[\s\S]*?<\/footer>/)[0].replace(/\s+/g," ").trim();
const mainMap=fs.readFileSync(path.join(ROOT,"sitemap.xml"),"utf8");
const guideMap=fs.readFileSync(path.join(ROOT,"sitemap-guides.xml"),"utf8");
const mapUrls=[...guideMap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.equal(mapUrls.length,77);
assert.equal(new Set(mapUrls).size,77);
assert.equal(Object.keys(guideGroups).length,11);
assert.match(fs.readFileSync(path.join(ROOT,"tools/build-i18n.js"),"utf8"),/'guides'/,"legacy locale generator must exclude owned article directories");
const allTitles=new Set(),allDescriptions=new Set();
let articleCount=0;
for(const [lang,info] of Object.entries(languages)){
  const d=require(`../data/guides/${lang}.json`),home=read(info.home),indexPath=guideGroups["guide:index"][lang],index=read(indexPath);
  assert.equal(Object.keys(d.articles).length,10,lang);
  assert.equal((home.match(/id="travel-guides"/g)||[]).length,1,lang+": one added discovery section");
  assert.ok(home.includes(`href="${indexPath}"`),lang+": homepage discovers article index");
  const expectedFooter=footer(home).replace(/(src|href)="assets\//g,'$1="/assets/');
  const paragraphSet=new Set();
  for(const id of ["index",...catalog.topics.map(t=>t.id)]){
    const urlPath=guideGroups["guide:"+id][lang],url=BASE+urlPath,html=read(urlPath);
    assert.match(html,new RegExp(`<html lang="${lang}" dir="${["ar","fa"].includes(lang)?"rtl":"ltr"}">`),url);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,url+": one H1");
    assert.doesNotMatch(html,/undefined|class="[^"]*breadcrumb|aggregateRating/,url);
    assert.equal((html.match(/rel="canonical"/g)||[]).length,1,url);
    assert.ok(html.includes(`rel="canonical" href="${url}"`),url+": self canonical");
    assert.ok(html.includes(`property="og:url" content="${url}"`),url+": social URL");
    const title=html.match(/<title>(.*?)<\/title>/)[1],description=html.match(/name="description" content="([^"]+)"/)[1];
    assert.ok(title.length>20&&!allTitles.has(title),url+": unique title");allTitles.add(title);
    assert.ok(description.length>70&&!allDescriptions.has(description),url+": distinct description");allDescriptions.add(description);
    assert.equal(footer(html),expectedFooter,url+": localized shared footer");
    assert.ok(mainMap.includes(`<loc>${url}</loc>`)&&mapUrls.includes(url),url+": both sitemaps");
    const tags=[...html.matchAll(/<link\b[^>]*rel="alternate"[^>]*>/g)].map(m=>m[0]);
    assert.equal(tags.length,8,url+": seven reciprocal versions and default");
    for(const tag of tags){
      const code=attr(tag,"hreflang"),target=attr(tag,"href"),other=read(new URL(target).pathname);
      if(code!=="x-default")assert.ok(other.includes(`hreflang="${info.hreflang}" href="${url}"`),url+": reciprocal "+code);
    }
    const menu=html.match(/<details class="language-switcher">([\s\S]*?)<\/details>/)[1];
    for(const target of Object.values(guideGroups["guide:"+id]))assert.ok(menu.includes(`href="${target}"`),url+": language switch retains topic");
    for(const tag of [...html.matchAll(/<(?:a|img|link|script)\b[^>]*>/g)].map(m=>m[0])){
      const value=attr(tag,"href")||attr(tag,"src");
      if(!value||/^(https?:|mailto:|tel:)/.test(value))continue;
      const resolved=new URL(value,url),file=path.join(ROOT,resolved.pathname,resolved.pathname.endsWith("/")?"index.html":"");
      assert.ok(fs.existsSync(file),url+": link/asset "+value);
      if(resolved.hash){
        const text=fs.readFileSync(file,"utf8");
        assert.ok(text.includes(`id="${resolved.hash.slice(1)}"`),url+": real anchor "+value);
      }
    }
    const graph=JSON.parse(html.match(/type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
    if(id==="index"){
      const list=graph.find(g=>g["@type"]==="ItemList");
      assert.equal(list.itemListElement.length,10,lang+": ten discoverable guides");
      continue;
    }
    articleCount++;
    const a=d.articles[id],topic=catalog.topics.find(t=>t.id===id);
    assert.equal(a.sections.length,4);assert.equal(a.checklist.length,4);assert.equal(a.faq.length,2);
    assert.ok(index.includes(`href="${urlPath}"`),url+": linked from its index");
    for(const [heading,p] of a.sections){
      assert.ok(heading.length>5&&p.length>120,url+": complete substantive section");
      assert.ok(!paragraphSet.has(p),url+": no recycled section within locale");paragraphSet.add(p);
    }
    for(const rel of topic.related)assert.ok(html.includes(`href="${guideGroups["guide:"+rel][lang]}"`),url+": related guide");
    assert.ok(html.includes(`href="${groups[topic.hotelPage][lang]}"`),url+": relevant hotel page");
    for(const source of topic.sources)assert.ok(html.includes(source.url),url+": official source");
    const article=graph.find(g=>g["@type"]==="Article");
    assert.equal(article.mainEntityOfPage["@id"],url+"#webpage");
    assert.equal(article.datePublished,catalog.publishedAt);
    assert.equal(article.dateModified,catalog.updatedAt);
    assert.equal(article.inLanguage,lang);
    assert.equal(article.author["@id"],BASE+"/#hotel");
    assert.ok(html.includes(`datetime="${catalog.updatedAt}"`),url+": visible actual date");
  }
  const json=JSON.stringify(d);
  if(lang!=="ar")assert.doesNotMatch(json,/bidet|биде|شطاف|بیده|شلنگ/i,lang+": Arabic-only amenity wording");
  const native={ar:/[\u0600-\u06ff]/g,fa:/[\u0600-\u06ff]/g,ru:/[А-Яа-яЁё]/g,ka:/[\u10a0-\u10ff]/g}[lang];
  if(native)assert.ok((json.match(native)||[]).length>2500,lang+": full native-language content");
}
assert.equal(articleCount,70);
console.log("Validated 70 substantive articles and 7 indexes: metadata, native copy, reciprocal languages, shared footers, sources, all local assets/anchors and both sitemaps.");

