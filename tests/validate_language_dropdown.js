const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const names={tr:"Türkçe",en:"English",ar:"العربية",ka:"ქართული",ru:"Русский",az:"Azərbaycanca",fa:"فارسی"};
function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    if([".git","node_modules"].includes(entry.name))return [];
    const file=path.join(dir,entry.name);
    return entry.isDirectory()?walk(file):[file];
  });
}
let count=0;
for(const file of walk(root).filter(file=>file.endsWith(".html"))){
  const html=fs.readFileSync(file,"utf8");
  if(!html.includes("language-switcher"))continue;
  const menus=[...html.matchAll(/<details class="language-switcher">([\s\S]*?)<\/details>/g)];
  assert.equal(menus.length,1,file+": one closed native disclosure");
  assert.doesNotMatch(html,/<div[^>]*class="[^"]*language-switcher/,file+": no old horizontal pills");
  const menu=menus[0][1];
  assert.equal((menu.match(/<summary\b/g)||[]).length,1,file+": one keyboard-operable toggle");
  assert.equal((menu.match(/<a\b/g)||[]).length,7,file+": seven actual links");
  for(const [lang,name] of Object.entries(names)){
    assert.ok(menu.includes(`lang="${lang}"`),file+": "+lang);
    assert.ok(menu.includes(`>${name}<span`),file+": native language names");
  }
  assert.equal((menu.match(/aria-current="page"/g)||[]).length,1,file+": active language");
  count++;
}
for(const lang of Object.keys(names)){
  const events={},saved={},links=[];
  const summary={focused:false,focus(){this.focused=true;}};
  const inside={};
  const menu={open:false,contains:node=>node===inside||node===summary||links.includes(node),querySelector:()=>summary,addEventListener:()=>{}};
  for(const code of Object.keys(names)){
    const attributes={href:code==="tr"?"/room-types/":`/${code}/room-types/`};
    links.push({
      attributes,handlers:{},classList:{toggle(){}},
      getAttribute:key=>attributes[key],
      setAttribute:(key,value)=>{attributes[key]=value;},
      removeAttribute:key=>{delete attributes[key];},
      addEventListener(event,handler){this.handlers[event]=handler;}
    });
  }
  const document={
    readyState:"complete",activeElement:summary,
    querySelectorAll:selector=>selector==="details.language-switcher"?[menu]:links,
    addEventListener:(event,handler)=>{events[event]=handler;}
  };
  vm.runInNewContext(fs.readFileSync(path.join(root,"language.js"),"utf8"),{
    document,window:{location:{pathname:lang==="tr"?"/room-types/":`/${lang}/room-types/`}},
    localStorage:{setItem:(key,value)=>{saved[key]=value;}}
  });
  assert.equal(links.filter(link=>link.attributes["aria-current"]==="page").length,1);
  assert.equal(links[Object.keys(names).indexOf(lang)].attributes["aria-current"],"page");
  menu.open=true;events.click({target:inside});assert.equal(menu.open,true);
  events.click({target:{}});assert.equal(menu.open,false);
  menu.open=true;events.keydown({key:"Escape"});assert.equal(menu.open,false);assert.equal(summary.focused,true);
  menu.open=true;links[6].handlers.click();assert.equal(menu.open,false);assert.equal(saved.preferredLangPath,"/fa/room-types/");
}
console.log(`Validated accessible language dropdowns on ${count} pages, dismissal and persistence in all seven languages.`);

