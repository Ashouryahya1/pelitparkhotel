(() => {
  const LANGUAGE_STORAGE_KEY = "lang";
  const SUPPORTED_LANGUAGES = ["en", "ar", "tr"];
  const PREFIXED_LANGUAGES = new Set(["ar", "en"]);
  const translationsCache = {};

  const isBrowser = typeof window !== "undefined";

  const isPrefixedPath = (pathname) => /^\/(ar|en)(\/|$)/.test(pathname);

  const getLanguageFromPath = (pathname) => {
    const match = pathname.match(/^\/(ar|en)(?:\/|$)/);
    return match ? match[1] : null;
  };

  const normalizePathname = (pathname) =>
    isPrefixedPath(pathname) ? pathname.replace(/^\/(?:ar|en)(?:\/|$)/, "/") : pathname;

  const buildLocalizedPathname = (lang, pathname) => {
    const normalized = normalizePathname(pathname);
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

  const fetchTranslations = async (lang) => {
    if (translationsCache[lang]) return translationsCache[lang];

    const translationsUrl = `/translations/${lang}.json`;
    const response = await fetch(translationsUrl);
    if (!response.ok) {
      throw new Error(`Unable to load translations for ${lang}`);
    }

    const translations = await response.json();
    translationsCache[lang] = translations;
    return translations;
  };

  const applyTranslations = (translations, lang) => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-translate]").forEach((el) => {
      const key = el.getAttribute("data-translate");
      if (el.tagName.toLowerCase() === "input") {
        el.placeholder = translations[key] || el.placeholder;
      } else {
        const translatedValue = translations[key];
        if (translatedValue !== undefined) {
          el.innerHTML = translatedValue;
        } else if (!el.textContent) {
          el.textContent = key;
        }
      }
    });

    if (typeof window !== "undefined" && window.applyDateLocale) {
      window.applyDateLocale(lang);
    }
  };

  const setLanguage = async (lang) => {
    const desiredLanguage = SUPPORTED_LANGUAGES.includes(lang) ? lang : "en";

    try {
      const translations = await fetchTranslations(desiredLanguage);
      applyTranslations(translations, desiredLanguage);
    } catch (error) {
      console.error("Language file not found, fallback to English.");
      if (desiredLanguage !== "en") setLanguage("en");
    }
  };

  const navigateToLanguage = (lang) => {
    if (!isBrowser || !PREFIXED_LANGUAGES.has(lang)) return;

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

    setLanguage(selectedLang);
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

  const detectBrowserLanguage = () => {
    const navLang = (navigator.language || navigator.userLanguage || "en").slice(0, 2);
    return SUPPORTED_LANGUAGES.includes(navLang) ? navLang : "en";
  };

  const resolveInitialLanguage = () => {
    const pathname = isBrowser ? window.location.pathname : "/";
    const pathLang = getLanguageFromPath(pathname);
    if (pathLang) return pathLang;

    if (typeof localStorage !== "undefined") {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (SUPPORTED_LANGUAGES.includes(savedLang)) return savedLang;
    }

    return detectBrowserLanguage();
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
      const initialLanguage = resolveInitialLanguage();
      setLanguage(initialLanguage);
      persistPathLanguagePreference();
      setupLanguageButtons();
    });
  }

  if (typeof window !== "undefined") {
    window.setLanguage = setLanguage;
  }
})();
