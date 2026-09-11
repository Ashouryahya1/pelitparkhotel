const { languages } = require("./site-languages");
const e = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const labels = {tr:"Dil seçin",en:"Choose language",ar:"اختيار اللغة",ka:"ენის არჩევა",ru:"Выбрать язык",az:"Dil seçin",fa:"انتخاب زبان"};
function languageSelector(active,paths={}) {
  const current=languages[active]||languages.tr;
  const options=Object.entries(languages).map(([code,info]) => {
    const chosen=code===active?' class="is-active" aria-current="page"':"";
    return `<li><a href="${e(paths[code]||info.home)}" lang="${code}" hreflang="${info.hreflang}" dir="${["ar","fa"].includes(code)?"rtl":"ltr"}"${chosen}>${info.name}<span class="language-switcher__code" aria-hidden="true">${code.toUpperCase()}</span></a></li>`;
  }).join("");
  return `<details class="language-switcher"><summary class="language-switcher__toggle" aria-label="${e(labels[active]+": "+current.name)}"><i class="ri-global-line" aria-hidden="true"></i><span class="language-switcher__current" lang="${active}" dir="auto">${current.name}</span><i class="ri-arrow-down-s-line language-switcher__chevron" aria-hidden="true"></i></summary><ul class="language-switcher__list" aria-label="${e(labels[active])}">${options}</ul></details>`;
}
module.exports={languageSelector};

