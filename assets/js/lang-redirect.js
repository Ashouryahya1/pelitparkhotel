(() => {
  if (typeof window === "undefined" || window.location.pathname !== "/") return;

  const labels = {
    fa: { message: "مایلید سایت را به فارسی ببینید؟", action: "فارسی", close: "بستن پیشنهاد زبان" },
    ru: { message: "Хотите открыть сайт на русском языке?", action: "Русский", close: "Закрыть предложение языка" },
    az: { message: "Saytı azərbaycanca açmaq istəyirsiniz?", action: "Azərbaycanca", close: "Dil təklifini bağlayın" },
    ar: { message: "هل تفضّل تصفح الموقع بالعربية؟", action: "العربية", close: "إغلاق اقتراح اللغة" },
    en: { message: "Would you prefer to view the site in English?", action: "English", close: "Dismiss language suggestion" },
    ka: { message: "გსურთ ვებსაიტის ქართულად ნახვა?", action: "ქართული", close: "ენის შეთავაზების დახურვა" },
  };

  let preferredPath;
  try {
    preferredPath = localStorage.getItem("preferredLangPath");
    if (preferredPath || sessionStorage.getItem("languageSuggestionDismissed")) return;
  } catch (error) {
    console.warn("Unable to read language preferences.", error);
  }

  const browserLanguages = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages
    : [navigator.language || ""];
  const match = browserLanguages
    .map((language) => String(language).toLowerCase())
    .find((language) => /^(ar|en|ka|ru|az|fa)(-|$)/.test(language));
  if (!match) return;

  const language = match.split("-")[0];
  const targetPath = `/${language}/`;
  const copy = labels[language];

  const showSuggestion = () => {
    if (document.querySelector(".language-suggestion")) return;
    const banner = document.createElement("aside");
    banner.className = "language-suggestion";
    banner.setAttribute("aria-label", copy.message);

    const message = document.createElement("span");
    message.textContent = copy.message;

    const link = document.createElement("a");
    link.href = targetPath;
    link.textContent = copy.action;
    link.addEventListener("click", () => {
      try { localStorage.setItem("preferredLangPath", targetPath); } catch (_) {}
    });

    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", copy.close);
    close.textContent = "×";
    close.addEventListener("click", () => {
      banner.remove();
      try { sessionStorage.setItem("languageSuggestionDismissed", "1"); } catch (_) {}
    });

    banner.append(message, link, close);
    document.body.appendChild(banner);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showSuggestion, { once: true });
  } else {
    showSuggestion();
  }
})();
