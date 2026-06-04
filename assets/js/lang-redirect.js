(() => {
  if (typeof window === "undefined") return;

  const addArabicHomeLinks = () => {
    const normalizedPath = window.location.pathname.replace(/\/+$/, "/");
    if (normalizedPath !== "/ar/") return;
    if (document.getElementById("arabic-booking-pages")) return;

    const bookingSection = document.querySelector(".booking__container");
    if (!bookingSection) return;

    const section = document.createElement("section");
    section.className = "section__container goals__section";
    section.id = "arabic-booking-pages";
    section.innerHTML = `
      <p class="section__subheader">صفحات مهمة للحجز</p>
      <h2 class="section__header">اختر الصفحة المناسبة لرحلتك إلى طرابزون</h2>
      <p class="section__description roomtypes__lede">للحصول على أفضل تجربة حجز، يمكنك زيارة الصفحات المخصصة للعائلات الخليجية، عروض الصيف، الحجز عبر واتساب، القرب من مطار طرابزون، والغرف المطلة على البحر.</p>
      <div class="goals__grid">
        <a class="goal__card" href="/ar/gulf-family-hotel-trabzon/" style="color: inherit; text-decoration: none;">
          <h3>فندق للعائلات الخليجية</h3>
          <p>غرف مريحة وتواصل باللغة العربية عبر واتساب للعائلات القادمة من دول الخليج.</p>
        </a>
        <a class="goal__card" href="/ar/whatsapp-booking-discount-trabzon-hotel/" style="color: inherit; text-decoration: none;">
          <h3>حجز عبر واتساب مع خصم</h3>
          <p>راسلنا مباشرة لمعرفة أفضل سعر متاح حسب تاريخ الإقامة ونوع الغرفة.</p>
        </a>
        <a class="goal__card" href="/ar/trabzon-summer-hotel-offer/" style="color: inherit; text-decoration: none;">
          <h3>عروض صيف طرابزون</h3>
          <p>صفحة مخصصة لعروض الصيف للعائلات الخليجية خلال موسم السفر إلى طرابزون.</p>
        </a>
        <a class="goal__card" href="/ar/hotel-near-trabzon-airport/" style="color: inherit; text-decoration: none;">
          <h3>فندق قريب من مطار طرابزون</h3>
          <p>موقع مناسب للوصول السريع مع إمكانية السؤال عن خدمة استقبال المطار.</p>
        </a>
        <a class="goal__card" href="/ar/sea-view-hotel-trabzon/" style="color: inherit; text-decoration: none;">
          <h3>فندق مطل على البحر</h3>
          <p>اسأل عن توفر الغرف ذات الإطلالة البحرية وأفضل سعر للحجز المباشر.</p>
        </a>
      </div>
    `;

    bookingSection.insertAdjacentElement("afterend", section);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addArabicHomeLinks);
  } else {
    addArabicHomeLinks();
  }

  const { pathname, search } = window.location;
  const isLanguagePath = /^\/(en|ar)(\/|$)/.test(pathname);
  if (isLanguagePath) return;
  if (pathname !== "/") return;

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
