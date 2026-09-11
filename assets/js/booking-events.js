(() => {
  const ALLOWED_EVENTS = new Set(["booking_click", "whatsapp_click", "directions_click"]);

  function pageLanguage() {
    const declared = (document.documentElement.lang || "").toLowerCase().split("-")[0];
    if (["tr", "en", "ar", "ka", "ru", "az"].includes(declared)) return declared;
    const segment = window.location.pathname.split("/").filter(Boolean)[0];
    return ["en", "ar", "ka", "ru", "az"].includes(segment) ? segment : "tr";
  }

  function inferredEvent(link) {
    const explicit = link.getAttribute("data-booking-event");
    if (ALLOWED_EVENTS.has(explicit)) return explicit;

    try {
      const url = new URL(link.href, window.location.href);
      if (["wa.me", "api.whatsapp.com"].includes(url.hostname)) return "whatsapp_click";
      if (url.hostname === "pelit-park.rezervasyonal.com") return "booking_click";
    } catch (_) {
      return "";
    }
    return "";
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const eventName = inferredEvent(link);
    if (!eventName) return;

    const url = new URL(link.href, window.location.href);
    const parameters = {
      page_language: pageLanguage(),
      page_path: window.location.pathname,
      link_host: url.hostname,
      link_path: url.pathname,
      conversion_stage: "outbound_click",
      booking_confirmed: false
    };

    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, parameters);
      if (eventName === "whatsapp_click") {
        window.gtag("event", "conversion", {
          send_to: "AW-18172085628/ug94CNrMjM8cEPyKkNlD",
          transport_type: "beacon",
          conversion_stage: "outbound_click",
          booking_confirmed: false
        });
      }
    } else {
      window.dataLayer.push({ event: eventName, ...parameters });
    }
  });
})();
