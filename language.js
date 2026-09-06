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
    document.querySelectorAll(".language-switcher").forEach((switcher) => {
      if (switcher.querySelector('a[href="/ka/"]')) return;
      const georgianLink = document.createElement("a");
      georgianLink.href = "/ka/";
      georgianLink.textContent = "KA";
      georgianLink.setAttribute("aria-label", "ქართული");
      const turkishLink = switcher.querySelector('a[href="/"]');
      switcher.insertBefore(georgianLink, turkishLink || null);
    });

    const links = document.querySelectorAll(".language-switcher a");
    const path = window.location.pathname || "/";
    const activeHref = path.startsWith("/ar/")
      ? "/ar/"
      : path.startsWith("/en/")
        ? "/en/"
        : path.startsWith("/ka/")
          ? "/ka/"
          : "/";

    links.forEach((link) => {
      const href = link.getAttribute("href");
      const isActive = href === activeHref;
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

