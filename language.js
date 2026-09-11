(() => {
  const STORAGE_KEY = "preferredLangPath";
  const languageForPath = value => value?.match(/^\/(ar|en|ka|ru|az|fa)(?:\/|$)/)?.[1] || (value?.startsWith("/") ? "tr" : "");
  const setupLanguageLinks = () => {
    const menus = [...document.querySelectorAll("details.language-switcher")];
    const activeLanguage = languageForPath(window.location.pathname || "/");
    document.querySelectorAll(".language-switcher a").forEach(link => {
      const active = languageForPath(link.getAttribute("href")) === activeLanguage;
      link.classList.toggle("is-active",active);
      if(active) link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
      link.addEventListener("click", () => {
        try { localStorage.setItem(STORAGE_KEY,link.getAttribute("href")); } catch (_) {}
        menus.forEach(menu => { menu.open=false; });
      });
    });
    // Native details/summary supports Enter and Space without JavaScript.
    // Also close on outside click or Escape and keep keyboard focus in place.
    menus.forEach(menu => menu.addEventListener("toggle", () => {
      if(menu.open) menus.filter(other => other!==menu).forEach(other => { other.open=false; });
    }));
    document.addEventListener("click", event => {
      menus.filter(menu => menu.open && !menu.contains(event.target)).forEach(menu => { menu.open=false; });
    });
    document.addEventListener("keydown", event => {
      if(event.key!=="Escape") return;
      menus.filter(menu => menu.open).forEach(menu => {
        menu.open=false;
        if(menu.contains(document.activeElement)) menu.querySelector("summary").focus();
      });
    });
  };
  if(typeof document!=="undefined"){
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",setupLanguageLinks,{once:true});
    else setupLanguageLinks();
  }
})();
