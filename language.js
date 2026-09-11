(() => {
  const STORAGE_KEY = "preferredLangPath";

  const persistPreferredLanguage = (event) => {
    const target = event.currentTarget;
    if (!target) return;
    const href = target.getAttribute("href");
    if (!href) return;

    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, href);
      }
    } catch (error) {
      console.warn("Unable to save preferred language.", error);
    }
  };

  const setupLanguageLinks = () => {
    const links = document.querySelectorAll(".language-switcher a");
    const path = window.location.pathname || "/";
    const languageForPath = (value) => value?.match(/^\/(ar|en|ka|ru|az)(?:\/|$)/)?.[1] || (value?.startsWith("/") ? "tr" : "");
    const activeLanguage = languageForPath(path);

    links.forEach((link) => {
      const href = link.getAttribute("href");
      const linkLanguage = languageForPath(href);
      const isActive = linkLanguage === activeLanguage;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
      link.addEventListener("click", persistPreferredLanguage);
    });
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", setupLanguageLinks);
  }
})();
