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
    document.querySelectorAll(".language-switcher a").forEach((link) => {
      link.addEventListener("click", persistPreferredLanguage);
    });
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", setupLanguageLinks);
  }
})();
