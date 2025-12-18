(() => {
  const LANGUAGE_STORAGE_KEY = "lang";
  const SUPPORTED_LANGUAGES = new Set(["ar", "en", "tr"]);
  const PREFIXED_LANGUAGES = new Set(["ar", "en"]);

  const isBrowser = typeof window !== "undefined";

  const isPrefixedPath = (pathname) => /^\/(ar|en)(\/|$)/.test(pathname);

  const getLanguageFromPath = (pathname) => {
    const match = pathname.match(/^\/(ar|en)(?:\/|$)/);
    return match ? match[1] : null;
  };

  const normalizePathname = (pathname) =>
    isPrefixedPath(pathname) ? pathname.replace(/^\/(?:ar|en)(?:\/|$)/, "/") : pathname;

  const buildLocalizedPathname = (lang, pathname) => {
    if (!SUPPORTED_LANGUAGES.has(lang)) return pathname;

    const normalized = normalizePathname(pathname);
    if (!PREFIXED_LANGUAGES.has(lang)) {
      return normalized === "/" ? "/" : normalized;
    }

    if (normalized === "/") {
      return `/${lang}/`;
    }

    const trimmed = normalized.startsWith("/") ? normalized.slice(1) : normalized;
    return `/${lang}/${trimmed}`;
  };

  const handlePreferredHomepageRedirect = () => {
    if (!isBrowser || typeof localStorage === "undefined") return;

    const { pathname } = window.location;
    if (isPrefixedPath(pathname)) return;
    if (pathname !== "/" && pathname !== "/index.html") return;

    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (PREFIXED_LANGUAGES.has(savedLang)) {
      window.location.replace(buildLocalizedPathname(savedLang, "/"));
    }
  };

  const navigateToLanguage = (lang) => {
    if (!isBrowser || !SUPPORTED_LANGUAGES.has(lang)) return;

    const { pathname, search, hash } = window.location;
    const targetPathname = buildLocalizedPathname(lang, pathname);
    const targetUrl = `${targetPathname}${search}${hash}`;

    if (targetUrl !== `${pathname}${search}${hash}`) {
      window.location.href = targetUrl;
    }
  };

  const handleLanguageSelection = (selectedLang) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLang);
    }

    navigateToLanguage(selectedLang);
  };

  const setupLanguageButtons = () => {
    document.querySelectorAll(".language-switcher button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const selectedLang = btn.dataset.lang;
        if (SUPPORTED_LANGUAGES.has(selectedLang)) {
          handleLanguageSelection(selectedLang);
        }
      });
    });
  };

  const persistPathLanguagePreference = () => {
    if (!isBrowser || typeof localStorage === "undefined") return;
    const pathLang = getLanguageFromPath(window.location.pathname);
    if (pathLang) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, pathLang);
    } else {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, "tr");
    }
  };

  handlePreferredHomepageRedirect();

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      persistPathLanguagePreference();
      setupLanguageButtons();
    });
  }
})();
