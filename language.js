(() => {
  const LANGUAGE_STORAGE_KEY = "lang";
  const LANGUAGE_PREFIXES = {
    tr: "",
    en: "/en",
    ar: "/ar",
  };

  const isBrowser = typeof window !== "undefined";

  const isPrefixedPath = (pathname) => /^\/(ar|en|tr)(\/|$)/.test(pathname);

  const getLanguageFromPath = (pathname) => {
    const match = pathname.match(/^\/(ar|en|tr)(?:\/|$)/);
    if (match) return match[1];
    return "tr";
  };

  const normalizePathname = (pathname) => {
    if (!isPrefixedPath(pathname)) return pathname || "/";
    const normalized = pathname.replace(/^\/(?:ar|en|tr)(?=\/|$)/, "");
    return normalized || "/";
  };

  const buildLocalizedPathname = (lang, pathname) => {
    const normalized = normalizePathname(pathname) || "/";
    const prefix = LANGUAGE_PREFIXES[lang] ?? "";

    if (normalized === "/") {
      return prefix ? `${prefix}/` : "/";
    }

    const trimmed = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return prefix ? `${prefix}${trimmed}` : trimmed;
  };

  const handlePreferredHomepageRedirect = () => {
    if (!isBrowser || typeof localStorage === "undefined") return;

    const { pathname } = window.location;
    const isHomePath = pathname === "/" || pathname === "/index.html" || /^\/tr\/?$/.test(pathname);

    if (!isHomePath) return;

    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLang && LANGUAGE_PREFIXES[savedLang] !== undefined && savedLang !== "tr") {
      window.location.replace(buildLocalizedPathname(savedLang, "/"));
    }
  };

  const navigateToLanguage = (lang) => {
    if (!isBrowser || LANGUAGE_PREFIXES[lang] === undefined) return;

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
        handleLanguageSelection(selectedLang);
      });
    });
  };

  const persistPathLanguagePreference = () => {
    if (!isBrowser || typeof localStorage === "undefined") return;
    const pathLang = getLanguageFromPath(window.location.pathname);
    if (pathLang) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, pathLang);
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
