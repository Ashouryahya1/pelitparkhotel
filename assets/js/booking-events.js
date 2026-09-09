(() => {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-booking-event]");
    if (!link) return;

    const eventName = link.getAttribute("data-booking-event");
    const parameters = { page_language: "ka", market: "georgia" };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...parameters });

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, parameters);
      if (eventName === "whatsapp_click") {
        window.gtag("event", "conversion", {
          send_to: "AW-18172085628/ug94CNrMjM8cEPyKkNlD",
          transport_type: "beacon"
        });
      }
    }
  });
})();
