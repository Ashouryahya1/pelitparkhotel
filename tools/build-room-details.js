const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { ROOT, BASE, languages, groups, guideGroups } = require('./lib/site-languages');
const facts = require('../data/hotel-facts.json');
const copy = require('../data/room-details.json');
const guideCopy = Object.fromEntries(Object.keys(languages).map(lang => [lang, require(`../data/guides/${lang}.json`)]));
const e = value => String(value).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const values = {
  regularBase: facts.rooms.regularOccupancy.baseGuests, regularMax: facts.rooms.regularOccupancy.withExtraBedGuests,
  suiteBase: facts.rooms.familySuite.baseGuests, suiteMax: facts.rooms.familySuite.withExtraBedGuests,
  suiteFloor: facts.rooms.familySuite.floor, liftFloor: facts.rooms.familySuite.liftTopFloor,
  extraBed: facts.booking.extraBed.eurPerDay, babyCot: facts.booking.babyCot.eurPerDay,
  checkIn: facts.arrival.checkIn, checkOut: facts.arrival.checkOut, earlyFrom: facts.arrival.freeEarlyCheckInFrom,
  breakfastStart: facts.breakfast.start, breakfastEnd: facts.breakfast.end, tv: facts.roomAmenities.smartTvInches
};
function localize(value) {
  if (Array.isArray(value)) return value.map(localize);
  return value.replace(/\{(\w+)\}/g, (_, key) => {
    if (!(key in values)) throw new Error('Unknown hotel fact: '+key);
    return values[key];
  });
}
const ids = ['room-deluxe', 'room-twin', 'room-standard', 'family-suite'];
const stylesheet = 'assets/css/room-details.css';
const version = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, stylesheet))).digest('hex').slice(0,12);
for (const lang of Object.keys(languages)) {
  const d = Object.fromEntries(Object.entries(copy[lang]).map(([key,value]) => [key,localize(value)]));
  const urlPath = groups.rooms[lang], canonical = BASE+urlPath, file = path.join(ROOT,urlPath,'index.html');
  let html = fs.readFileSync(file,'utf8');
  html = html.replace(/<!-- ROOM_DETAILS_START -->[\s\S]*?<!-- ROOM_DETAILS_END -->/g,'')
    .replace(/<link\b[^>]*data-room-details-css[^>]*>/g,'')
    .replace(/<span id="room-(?:deluxe|twin|standard)" class="room-details__anchor" aria-hidden="true"><\/span>/g,'')
    .replace(/<script\b[^>]*data-room-schema[^>]*>[\s\S]*?<\/script>/g,'');
  html = html.replace(/<title>[\s\S]*?<\/title>/,`<title>${e(d.title)}</title>`);
  for (const [attr, key, value] of [['name','description',d.description],['property','og:title',d.title],['property','og:description',d.description],['name','twitter:title',d.title],['name','twitter:description',d.description]]) {
    html = html.replace(new RegExp(`<meta\\b(?=[^>]*${attr}=["']${key}["'])[^>]*>`),`<meta ${attr}="${key}" content="${e(value)}" />`);
  }
  html = html.replace(/(<h1\b[^>]*>)[\s\S]*?(<\/h1>)/,`$1${e(d.heading)}$2`);
  html = html.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>\s*<p\b[^>]*>)[\s\S]*?(<\/p>)/,`$1${e(d.intro)}$2`);
  html = html.replace(/(<p\b[^>]*class="[^"]*roomtypes__lede[^"]*"[^>]*>)[\s\S]*?(<\/p>)/,`$1${e(d.intro)}$2`);
  // Replace only the old comparison section, not room images or amenity cards.
  html = html.replace(/<section\b[^>]*>[\s\S]*?<\/section>/g, section => /<table\b/.test(section) && /room-comparison|georgian-comparison-table/.test(section) ? '' : section);
  const beds=[d.doubleBed,d.twinBeds,d.doubleBed,d.suiteBeds];
  const capacities=[d.regularCapacity,d.regularCapacity,d.regularCapacity,d.suiteCapacity];
  const views=[d.seaView,d.unspecifiedView,d.unspecifiedView,d.suiteView];
  const guideLink = id => `<a href="${guideGroups['guide:'+id][lang]}">${e(guideCopy[lang].articles[id].title)}</a>`;
  const newSections = `<!-- ROOM_DETAILS_START -->
<section class="section__container room-details" id="room-comparison" aria-labelledby="room-comparison-title">
<h2 class="section__header" id="room-comparison-title">${e(d.comparisonTitle)}</h2><p>${e(d.occupancyNote)}</p>
<div class="room-details__table" tabindex="0" role="region" aria-labelledby="room-comparison-title"><table><caption>${e(d.comparisonTitle)}</caption><thead><tr>${d.columns.map(c=>`<th scope="col">${e(c)}</th>`).join('')}</tr></thead><tbody>${ids.map((id,i)=>`<tr><th scope="row"><a href="#${id}">${e(d.roomNames[i])}</a></th><td>${e(beds[i])}</td><td>${e(capacities[i])}</td><td>${e(views[i])}</td></tr>`).join('')}</tbody></table></div><p>${e(d.amenities)}</p>
</section>
<section class="section__container room-details" id="family-suite" aria-labelledby="family-suite-title"><div class="room-details__suite">
<h2 class="section__header" id="family-suite-title">${e(d.suiteTitle)}</h2><p>${e(d.suiteLayout)}</p><p>${e(d.suiteViewText)}</p>
<div class="room-details__access"><h3>${e(d.suiteAccessTitle)}</h3><p>${e(d.suiteAccess)}</p></div>
<p>${guideLink('family-stays')}</p><a class="btn" href="${facts.booking.engineUrl}" target="_blank" rel="noopener noreferrer" data-booking-event="booking_click">${e(d.chooseSuite)}</a>
</div></section>
<section class="section__container room-details" aria-labelledby="room-policies-title"><h2 class="section__header" id="room-policies-title">${e(d.policiesTitle)}</h2><div class="room-details__policies">
<article id="extra-beds"><h3>${e(d.feesTitle)}</h3><ul><li>${e(d.extraBed)}</li><li>${e(d.babyCot)}</li></ul><p>${e(d.feeNote)}</p><p>${guideLink('hotel-prices')}</p></article>
<article id="arrival-policy"><h3>${e(d.arrivalTitle)}</h3><p>${e(d.arrival)}</p><p>${guideLink('airport-arrival')}</p></article>
<article id="breakfast"><h3>${e(d.breakfastTitle)}</h3><p>${e(d.breakfast)}</p><p>${guideLink('first-visit')}</p></article>
</div></section>
<!-- ROOM_DETAILS_END -->`;
  let found = false;
  html = html.replace(/<section\b[^>]*>[\s\S]*?<\/section>/g, section => {
    if (found || !section.includes('class="room__grid"')) return section;
    found = true;
    let count=0;
    section=section.replace(/(<(?:article|div)\b[^>]*class="room__card"[^>]*>)/g, tag => {
      const id=ids[count++];
      // Preserve existing room-1/2/3 anchors in the international editions.
      if(tag.includes(`id="${id}"`)) return tag;
      return tag.includes(' id=') ? tag+`<span id="${id}" class="room-details__anchor" aria-hidden="true"></span>` : tag.replace(/>$/,` id="${id}">`);
    });
    if(count!==3) throw new Error(`${lang}: expected three existing room cards, found ${count}`);
    // Only the old Standard copy referencing Booking.com's basics needs editing.
    section=section.replace(/<p>([^<]*Booking\.com[^<]*)<\/p>/g, `<p>${e(d.standardDescription)}</p>`);
    return section+newSections;
  });
  if(!found) throw new Error(lang+': room-card section not found');
  // Keep page metadata consistent with its visible title. Other schema stays intact.
  html=html.replace(/(<script\b[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g,(all,open,json,close)=>{
    const data=JSON.parse(json);let changed=false;
    const visit=node=>{if(!node||typeof node!=='object')return;if(node['@type']==='WebPage'){node.name=d.title;node.description=d.description;changed=true;}Object.values(node).forEach(v=>Array.isArray(v)?v.forEach(visit):visit(v));};visit(data);
    return changed?open+JSON.stringify(data).replace(/</g,'\\u003c')+close:all;
  });
  const graph=ids.map((id,i)=>({'@type':'HotelRoom','@id':canonical+'#'+id,url:canonical+'#'+id,name:d.roomNames[i],containedInPlace:{'@id':BASE+'/#hotel'},bed:beds[i],occupancy:{'@type':'QuantitativeValue',maxValue:i===3?values.suiteMax:values.regularMax},description:i===3?[d.suiteLayout,d.suiteViewText,d.suiteAccess].join(' '):views[i],...(i===3?{numberOfBedrooms:facts.rooms.familySuite.bedrooms,numberOfBathroomsTotal:facts.rooms.familySuite.bathrooms,floorLevel:String(values.suiteFloor)}:{})}));
  html=html.replace('</head>',`<link data-room-details-css rel="stylesheet" href="/${stylesheet}?v=${version}" /><script data-room-schema type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script></head>`);
  // Preserve legacy line endings outside touched metadata, cards and additions.
  html=html.split('\n').map(line=>/ROOM_DETAILS_|data-room-|roomtypes__lede|id="room-(deluxe|twin|standard)"|<meta\b.*(?:description|og:title|twitter:title)/.test(line)?line.replace(/\r$/,''):line.replace(/^[ \t]+\r?$/,'')).join('\n');
  if(html!==fs.readFileSync(file,'utf8'))fs.writeFileSync(file,html);
}
console.log('Updated room information, comparison, suite access, policies, localized SEO and HotelRoom data in seven languages.');
