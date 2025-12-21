(() => {
  if (typeof window === "undefined") return;

  const { pathname, search } = window.location;
  const isLanguagePath = /^\/(en|ar)(\/|$)/.test(pathname);
  if (isLanguagePath) return;

  const params = new URLSearchParams(search || "");
  if (params.has("lang")) return;

  try {
    const saved = localStorage.getItem("preferredLangPath");
    if (saved) return;
  } catch (error) {
    console.warn("Unable to read preferred language.", error);
  }

  const candidateLanguages = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages
    : [navigator.language || "en"];

  const normalized = candidateLanguages
    .map((lang) => (lang || "").toLowerCase());

  const match = normalized.find(
    (lang) => lang.startsWith("tr") || lang.startsWith("en") || lang.startsWith("ar")
  );

  let targetPath = "/en/";
  if (match) {
    if (match.startsWith("tr")) targetPath = "/";
    if (match.startsWith("en")) targetPath = "/en/";
    if (match.startsWith("ar")) targetPath = "/ar/";
  }

  if (targetPath === pathname) return;

  window.location.replace(targetPath);
})();
