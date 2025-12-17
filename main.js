const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn?.querySelector("i");

if (menuBtn && navLinks && menuBtnIcon) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");

    const isOpen = navLinks.classList.contains("open");
    menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
  });

  navLinks.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtnIcon.setAttribute("class", "ri-menu-line");
  });
}

const setupBookingDateControls = () => {
  const checkInInput = document.getElementById("check-in");
  const checkOutInput = document.getElementById("check-out");

  if (!checkInInput || !checkOutInput) return;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const toDateInputValue = (date) => date.toISOString().split("T")[0];

  checkInInput.min = toDateInputValue(today);
  checkOutInput.min = toDateInputValue(tomorrow);

  if (!checkInInput.value) checkInInput.value = checkInInput.min;
  if (!checkOutInput.value) checkOutInput.value = checkOutInput.min;

  checkInInput.addEventListener("change", () => {
    const selectedCheckIn = checkInInput.valueAsDate;
    if (!selectedCheckIn) return;

    const nextDay = new Date(selectedCheckIn);
    nextDay.setDate(selectedCheckIn.getDate() + 1);

    checkOutInput.min = toDateInputValue(nextDay);

    if (checkOutInput.valueAsDate && checkOutInput.valueAsDate < nextDay) {
      checkOutInput.value = checkOutInput.min;
    }
  });
};

const applyDateLocale = (lang) => {
  const checkInInput = document.getElementById("check-in");
  const checkOutInput = document.getElementById("check-out");

  if (!checkInInput || !checkOutInput) return;

  const isDayMonthYear = lang === "tr" || lang === "ar";
  const placeholder = isDayMonthYear ? "dd/mm/yyyy" : "yyyy-mm-dd";

  [checkInInput, checkOutInput].forEach((input) => {
    input.setAttribute("lang", lang);
    input.placeholder = placeholder;
  });
};

const setupSmoothScroll = () => {
  const triggers = document.querySelectorAll("[data-scroll-target]");

  triggers.forEach((trigger) => {
    const targetSelector = trigger.dataset.scrollTarget;
    if (!targetSelector) return;

    trigger.addEventListener("click", (event) => {
      const targetElement = document.querySelector(targetSelector);
      if (!targetElement) return;

      event.preventDefault();
      targetElement.scrollIntoView({ behavior: "smooth" });
    });
  });
};

const handleScrollQuery = () => {
  const url = new URL(window.location.href);
  const targetId = url.searchParams.get("scroll");
  if (!targetId) return;

  const targetElement = document.querySelector(`#${targetId}`);
  if (targetElement) {
    requestAnimationFrame(() => {
      targetElement.scrollIntoView({ behavior: "smooth" });
    });
  }

  url.searchParams.delete("scroll");
  window.history.replaceState({}, "", url);
};

const injectCenteredRightsMessage = () => {
  if (typeof document === "undefined") return;
  if (document.querySelector(".centered-rights-message")) return;

  const rightsMessage = document.createElement("div");
  rightsMessage.className = "centered-rights-message";
  rightsMessage.textContent = "© 2025 فندق بيليت بارك | جميع الحقوق محفوظة";

  document.body.appendChild(rightsMessage);
};

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    setupBookingDateControls();
    setupSmoothScroll();
    injectCenteredRightsMessage();

    if (typeof URL !== "undefined") {
      handleScrollQuery();
    }
  });
}

if (typeof window !== "undefined") {
  window.applyDateLocale = applyDateLocale;
}

const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

// header container
if (typeof ScrollReveal === "function") {
  ScrollReveal().reveal(".header__container p", {
    ...scrollRevealOption,
  });

  ScrollReveal().reveal(".header__container h1", {
    ...scrollRevealOption,
    delay: 500,
  });

  ScrollReveal().reveal(".header__container h2", {
    ...scrollRevealOption,
    delay: 600,
  });


  // about container
  ScrollReveal().reveal(".about__image img", {
    ...scrollRevealOption,
    origin: "left",
  });

  ScrollReveal().reveal(".about__content .section__subheader", {
    ...scrollRevealOption,
    delay: 500,
  });

  ScrollReveal().reveal(".about__content .section__header", {
    ...scrollRevealOption,
    delay: 1000,
  });

  ScrollReveal().reveal(".about__content .section__description", {
    ...scrollRevealOption,
    delay: 1500,
  });

  ScrollReveal().reveal(".about__btn", {
    ...scrollRevealOption,
    delay: 2000,
  });

  // room container
  ScrollReveal().reveal(".room__card", {
    ...scrollRevealOption,
    interval: 500,
  });

  // service container
  ScrollReveal().reveal(".service__list li", {
    ...scrollRevealOption,
    interval: 500,
    origin: "right",
  });

  // about page extras
  ScrollReveal().reveal(".story__content", {
    ...scrollRevealOption,
    delay: 300,
  });

  ScrollReveal().reveal(".story__image", {
    ...scrollRevealOption,
    origin: "right",
    delay: 500,
  });

  ScrollReveal().reveal(".founder__image", {
    ...scrollRevealOption,
    origin: "left",
    delay: 300,
  });

  ScrollReveal().reveal(".founder__content", {
    ...scrollRevealOption,
    delay: 500,
  });

  ScrollReveal().reveal(".goal__card", {
    ...scrollRevealOption,
    interval: 200,
  });

  // reviews page
  ScrollReveal().reveal(".reviews__metric", {
    ...scrollRevealOption,
    interval: 150,
  });

  ScrollReveal().reveal(".reviews__card", {
    ...scrollRevealOption,
    interval: 200,
  });

  ScrollReveal().reveal(".reviews__carousel", {
    ...scrollRevealOption,
    interval: 200,
  });

  ScrollReveal().reveal(".tip__card", {
    ...scrollRevealOption,
    interval: 150,
  });

  ScrollReveal().reveal(".guides__content", {
    ...scrollRevealOption,
  });

  ScrollReveal().reveal(".tips__cta__card", {
    ...scrollRevealOption,
    delay: 300,
  });
}

const initReviewCarousels = () => {
  const carousels = document.querySelectorAll(".reviews__carousel");

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".carousel__track");
    const slides = Array.from(track.children);
    const prevBtn = carousel.querySelector(".carousel__control.prev");
    const nextBtn = carousel.querySelector(".carousel__control.next");
    const indicatorsContainer = carousel.querySelector(".carousel__indicators");
    let activeIndex = 0;
    let autoplayTimer;

    if (!track || slides.length === 0 || !indicatorsContainer) return;

    const updateIndicators = (index) => {
      const indicators = indicatorsContainer.querySelectorAll(".carousel__indicator");
      indicators.forEach((indicator, idx) => {
        indicator.classList.toggle("active", idx === index);
      });
    };

    const goToSlide = (index) => {
      const targetIndex = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${targetIndex * 100}%)`;
      activeIndex = targetIndex;
      updateIndicators(activeIndex);
    };

    const buildIndicators = () => {
      indicatorsContainer.innerHTML = "";
      slides.forEach((_, index) => {
        const indicator = document.createElement("button");
        indicator.type = "button";
        indicator.className = "carousel__indicator";
        indicator.setAttribute(
          "aria-label",
          `Show ${carousel.dataset.platform || "review"} slide ${index + 1}`
        );
        indicator.dataset.slide = index;
        indicator.addEventListener("click", () => {
          goToSlide(index);
          restartAutoplay();
        });
        indicatorsContainer.appendChild(indicator);
      });
      updateIndicators(activeIndex);
    };

    const startAutoplay = () => {
      if (slides.length <= 1 || autoplayTimer) return;
      autoplayTimer = setInterval(() => {
        goToSlide(activeIndex + 1);
      }, 7000);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = undefined;
      }
    };

    const restartAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    if (slides.length > 1) {
      carousel.classList.add("is-carousel");
    }

    buildIndicators();
    goToSlide(activeIndex);
    startAutoplay();

    prevBtn?.addEventListener("click", () => {
      goToSlide(activeIndex - 1);
      restartAutoplay();
    });

    nextBtn?.addEventListener("click", () => {
      goToSlide(activeIndex + 1);
      restartAutoplay();
    });

    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);

    carousel.addEventListener("touchstart", stopAutoplay, { passive: true });
    carousel.addEventListener("touchend", startAutoplay, { passive: true });
  });
};

document.addEventListener("DOMContentLoaded", initReviewCarousels);
