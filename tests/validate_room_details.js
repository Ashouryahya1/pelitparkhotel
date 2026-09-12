const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {ROOT,BASE,languages,groups,guideGroups}=require('../tools/lib/site-languages');
const facts=require('../data/hotel-facts.json');
const copies=require('../data/room-details.json');
const read=url=>fs.readFileSync(path.join(ROOT,url,'index.html'),'utf8');
const e=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
let contextualLinks=0,reverseLinks=0;
for(const lang of Object.keys(languages)){
  const html=read(groups.rooms[lang]),copy=copies[lang];
  assert.ok(html.includes(`<title>${e(copy.title)}</title>`),lang+': localized room intent');
  assert.equal((html.match(/<!-- ROOM_DETAILS_START -->/g)||[]).length,1,lang+': one room detail block');
  for(const id of ['room-deluxe','room-twin','room-standard','family-suite','room-comparison','extra-beds','arrival-policy','breakfast'])
    assert.equal((html.match(new RegExp(`id="${id}"`,'g'))||[]).length,1,lang+': stable unique room anchor '+id);
  const graph=JSON.parse(html.match(/<script data-room-schema type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  assert.equal(graph.length,4);
  const suite=graph.find(n=>n['@id'].endsWith('#family-suite'));
  assert.equal(suite.numberOfBedrooms,2);assert.equal(suite.numberOfBathroomsTotal,2);
  assert.equal(suite.floorLevel,String(facts.rooms.familySuite.floor));
  assert.equal(suite.occupancy.maxValue,facts.rooms.familySuite.withExtraBedGuests);
  assert.ok(suite.description.includes(String(facts.rooms.familySuite.liftTopFloor)),lang+': lift limitation retained in schema');
  for(const room of graph){
    assert.equal(room.containedInPlace['@id'],BASE+'/#hotel');
    assert.ok(!room.offers,lang+': extra-bed fees must not become nightly room prices');
  }
  assert.ok(html.includes(e(copy.extraBed.replace('{extraBed}',facts.booking.extraBed.eurPerDay))),lang+': current extra-bed fee');
  assert.ok(html.includes(e(copy.babyCot.replace('{babyCot}',facts.booking.babyCot.eurPerDay))),lang+': current cot fee');
  assert.ok(html.includes('50'),lang+': room amenity retained');
  if(lang==='ar')assert.ok(html.includes('شطاف'));
  else assert.doesNotMatch(JSON.stringify(copy),/bidet|биде|شطاف|بیده|شلنگ/i);
  const pack=require(`../data/guides/${lang}.json`);
  for(const [id,article] of Object.entries(pack.articles)){
    assert.ok(article.inlineLinks.length>=2&&article.inlineLinks.length<=3,lang+'/'+id+': useful, bounded contextual links');
    const rendered=read(guideGroups['guide:'+id][lang]);
    for(const link of article.inlineLinks){
      const target=groups[link.target]?.[lang]||guideGroups[link.target]?.[lang];
      const href=target+(link.fragment?'#'+link.fragment:'');
      assert.ok(rendered.includes(`<a href="${href}">${e(link.text)}</a>`),lang+'/'+id+': readable real link');
      if(link.fragment)assert.ok(read(target).includes(`id="${link.fragment}"`),lang+'/'+id+': target anchor exists');
      contextualLinks++;
    }
  }
  assert.ok(read(guideGroups['guide:family-stays'][lang]).includes(`href="${groups.rooms[lang]}#family-suite"`),lang+': family guide reaches suite details');
  for(const [key,ids] of Object.entries({rooms:['sea-view-rooms','direct-booking'],airport:['airport-arrival','parking'],forum:['forum-shopping','first-visit'],farabi:['work-and-visits','family-stays']})){
    const page=read(groups[key][lang]);
    assert.equal((page.match(/<!-- PAGE_GUIDES_START -->/g)||[]).length,1,lang+'/'+key+': one guide discovery block');
    for(const id of ids){assert.ok(page.includes(`href="${guideGroups['guide:'+id][lang]}"`));reverseLinks++;}
  }
}
console.log(`Validated seven room pages, suite access and capacity, current fees, ${contextualLinks} contextual links and ${reverseLinks} reverse guide destinations.`);
