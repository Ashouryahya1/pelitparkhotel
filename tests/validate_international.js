const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname,"..");
const slugs = ["","about/","room-types/","reviews/","hotel-near-trabzon-airport/","hotel-near-forum-trabzon/","hotel-near-farabi-hospital/"];
const sitemap=fs.readFileSync(path.join(root,"sitemap.xml"),"utf8");
const footer=html=>html.match(/<footer\b[\s\S]*?<\/footer>/)[0];
const titles=new Set(),descriptions=new Set();
const attr=(tag,name)=>tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`))?.[1];
function signature(value) {
  if(Array.isArray(value))return value.map(signature);
  if(value&&typeof value==="object")return Object.fromEntries(Object.keys(value).sort().map(key=>[key,signature(value[key])]));
  return typeof value;
}
const ru=JSON.parse(fs.readFileSync(path.join(root,"data/locales/ru.json")));
const az=JSON.parse(fs.readFileSync(path.join(root,"data/locales/az.json")));
assert.deepEqual(signature(ru),signature(az),"Language packs must have complete matching content, with no silent fallback");
for(const lang of ["ru","az","fa"]) {
  const data=lang==="ru"?ru:lang==="az"?az:JSON.parse(fs.readFileSync(path.join(root,"data/locales/fa.json")));
  assert.deepEqual(signature(data),signature(ru),lang+": complete locale pack");
  const home=fs.readFileSync(path.join(root,lang,"index.html"),"utf8");
  for(const slug of slugs){
    const relative=`${lang}/${slug}index.html`,url=`https://pelitparkhotel.com/${lang}/${slug}`;
    const html=fs.readFileSync(path.join(root,relative),"utf8");
    assert.match(html,new RegExp(`<html lang="${lang}" dir="${lang==="fa"?"rtl":"ltr"}">`),relative);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,relative+": one H1");
    assert.doesNotMatch(html,/undefined|data-translate=|class="[^"]*breadcrumb|aggregateRating/,relative+": no fallback or visible breadcrumbs");
    assert.equal(footer(html),footer(home),relative+": same shared localized footer");
    assert.match(html,/<meta name="robots" content="index,follow"/,relative);
    assert.equal((html.match(/rel="canonical"/g)||[]).length,1,relative);
    assert.ok(html.includes(`rel="canonical" href="${url}"`),relative+": self canonical");
    assert.ok(sitemap.includes(`<loc>${url}</loc>`),relative+": sitemap discovery");
    const title=html.match(/<title>(.*?)<\/title>/)[1];
    const description=html.match(/name="description" content="([^"]+)"/)[1];
    assert.ok(title.length>15&&!titles.has(title),relative+": unique title");
    assert.ok(description.length>70&&!descriptions.has(description),relative+": unique useful description");
    titles.add(title);descriptions.add(description);
    assert.match(html,new RegExp(`property="og:locale" content="${data.locale}"`),relative);
    const languageMenu=html.match(/<details class="language-switcher"[^>]*>([\s\S]*?)<\/details>/)[1];
    assert.equal((languageMenu.match(/<a\b/g)||[]).length,7,relative+": all seven languages");
    assert.equal((languageMenu.match(/aria-current="page"/g)||[]).length,1,relative);
    // Independently verify the actual alternate destinations and their backlinks.
    const alternateTags=[...html.matchAll(/<link\b[^>]*rel="alternate"[^>]*>/g)].map(m=>m[0]);
    assert.equal(alternateTags.length,["about/","reviews/"].includes(slug)?7:8,relative+": equivalent languages only");
    assert.equal(new Set(alternateTags.map(t=>attr(t,"hreflang"))).size,alternateTags.length,relative+": no duplicate alternates");
    for(const tag of alternateTags){
      const href=attr(tag,"href"),code=attr(tag,"hreflang"),destination=new URL(href).pathname;
      const other=fs.readFileSync(path.join(root,destination,"index.html"),"utf8");
      if(code!=="x-default"){
        assert.ok(other.includes(`hreflang="${lang}" href="${url}"`),relative+": reciprocal "+code);
        assert.ok(other.includes(`rel="canonical" href="${href}"`),relative+": canonical alternate "+code);
      }
    }
    for(const tag of [...html.matchAll(/<(?:a|link|script|img)\b[^>]*>/g)].map(m=>m[0])){
      const value=attr(tag,"href")||attr(tag,"src");
      if(!value||/^(https?:|mailto:|tel:|#)/.test(value))continue;
      const clean=value.split(/[?#]/)[0],target=path.join(root,clean);
      const targetFile=clean.endsWith("/")?path.join(target,"index.html"):target;
      assert.ok(fs.existsSync(targetFile),relative+": asset/link exists "+value);
      if(value.includes("#")&&targetFile.endsWith(".html")){
        const fragment=value.split("#")[1],destination=fs.readFileSync(targetFile,"utf8");
        assert.ok(destination.includes(`id="${fragment}"`),relative+": anchor exists "+value);
      }
    }
    const graphs=[...html.matchAll(/type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).flatMap(o=>o["@graph"]||[o]);
    assert.ok(graphs.some(g=>g["@type"]==="Hotel"&&g["@id"]==="https://pelitparkhotel.com/#hotel"),relative+": consistent hotel identity");
    assert.ok(graphs.some(g=>g["@type"]==="WebPage"&&g.url===url&&g.inLanguage===lang),relative+": localized WebPage");
  }
  for(const slug of slugs.slice(1)) assert.ok(home.includes(`href="/${lang}/${slug}"`),lang+": home links to all new pages");
  for(const number of ["9 / 10","4.9 / 5","6,000+"]) assert.ok(home.includes(number),lang+": preserve owner-supplied statistics");
  const roomPage=fs.readFileSync(path.join(root,lang,"room-types/index.html"),"utf8");
  for(const room of data.rooms){
    assert.match(room.description,/50/);
    assert.ok(roomPage.includes(room.description)&&home.includes(room.description),lang+": same localized descriptions on home and rooms");
  }
  assert.doesNotMatch(JSON.stringify(data),/bidet|биде|شطاف|بیده|شلنگ/i,lang+": bidet copy remains Arabic only");
  const reviews=fs.readFileSync(path.join(root,lang,"reviews/index.html"),"utf8");
  assert.equal((reviews.match(/<blockquote\b/g)||[]).length,10,lang+": both platforms' archived selections");
  assert.ok(reviews.includes(data.labels.translated),lang+": translations disclosed");
  for(const author of ["Turnay","Arina","Sergey","Juliane","Aytan"]) assert.ok(reviews.includes(`data-review-author="${author}"`),lang+": original author");
}
// Verify new languages are attributed correctly, including the URL fallback.
const tracking=fs.readFileSync(path.join(root,"assets/js/booking-events.js"),"utf8");
for(const lang of ["ru","az","fa"]){
  for(const declared of [lang,""]){
    let click;
    const sent=[];
    const link={href:"https://pelit-park.rezervasyonal.com/",getAttribute:()=>null};
    const context={
      URL,
      document:{documentElement:{lang:declared},addEventListener:(event,handler)=>{if(event==="click")click=handler;}},
      window:{location:{pathname:`/${lang}/room-types/`,href:`https://pelitparkhotel.com/${lang}/room-types/`},gtag:(...args)=>sent.push(args)}
    };
    vm.runInNewContext(tracking,context);
    click({target:{closest:()=>link}});
    assert.equal(sent[0][2].page_language,lang);
    assert.equal(sent[0][2].booking_confirmed,false);
  }
}
console.log("Validated 21 Russian/Azerbaijani/Persian pages, seven-language reciprocity, shared footers, reviews, room amenities, assets and booking attribution.");

