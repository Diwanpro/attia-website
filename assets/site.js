/* ============================================================
   Attia Web Solutions — landing page behaviour
   Language, navigation, AOS reveal, 3D tilt, gallery, form
   ============================================================ */
(function () {
  "use strict";

  /* رابط Formspree الخاص بالنموذج (بديل: عدّل action في index.html) */
  var FORMSPREE_ENDPOINT = "https://formspree.io/f/mkjjpvjk";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     1. LANGUAGE
     ============================================================ */
  if (window.AttiaI18n) window.AttiaI18n.init();

  var langToggle = document.getElementById("langToggle");
  if (langToggle && window.AttiaI18n) {
    langToggle.addEventListener("click", function () { window.AttiaI18n.toggle(); });
  }

  /* ============================================================
     2. HEADER STATE + MOBILE MENU
     ============================================================ */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menuBtn = document.getElementById("menuBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!open));
      mobileMenu.classList.toggle("is-open", !open);
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menuBtn.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("is-open");
      });
    });
  }

  /* ============================================================
     3. ACTIVE NAV LINK
     ============================================================ */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var sections = navLinks.map(function (link) {
    return document.querySelector(link.getAttribute("href"));
  }).filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ============================================================
     4. AOS — scroll reveal
     ============================================================ */
  if (window.AOS) {
    window.AOS.init({
      duration: 750,
      easing: "ease-out-cubic",
      offset: 80,
      once: true,
      disable: reduceMotion
    });
  } else {
    document.documentElement.classList.add("aos-failed");
  }

  /* ============================================================
     5. VANILLA TILT — 3D cards & device
     ============================================================ */
  if (window.VanillaTilt && !reduceMotion) {
    var tiltTargets = document.querySelectorAll("[data-tilt]");
    if (tiltTargets.length) {
      window.VanillaTilt.init(tiltTargets, {
        max: 8,
        speed: 500,
        glare: false,
        "max-glare": 0.12,
        scale: 1.01,
        gyroscope: false,
        perspective: 1100
      });
    }
  }

  /* ============================================================
     6. PORTFOLIO GALLERY + LIGHTBOX
     ============================================================ */
  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot-btn"));
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCount = document.getElementById("lbCount");
  var lbCloseBtn = document.getElementById("lbClose");
  var lbPrevBtn = document.getElementById("lbPrev");
  var lbNextBtn = document.getElementById("lbNext");
  var lbIndex = 0;
  var lbTrigger = null;

  /* بديل أنيق إن لم تكن الصورة موجودة */
  Array.prototype.slice.call(document.querySelectorAll(".brand-tile img, .shot-view img, .phone-screen img")).forEach(function (img) {
    function markMissing() {
      var host = img.parentElement;
      if (!host) return;
      host.classList.add("is-missing");
      var btn = host.closest(".shot-btn");
      if (btn) btn.classList.add("is-disabled");
    }
    img.addEventListener("error", markMissing, { once: true });
    if (img.complete && img.naturalWidth === 0) markMissing();
  });

  function openShot(index) {
    if (!lb) return;
    var btn = shots[index];
    if (!btn || btn.classList.contains("is-disabled")) return;
    var img = btn.querySelector("img");
    if (!img) return;
    lbIndex = index;
    lbTrigger = btn;
    lbImg.src = img.getAttribute("src");
    lbImg.alt = img.getAttribute("alt") || "";
    lbCount.textContent = (index + 1) + " / " + shots.length;
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    lbCloseBtn.focus({ preventScroll: true });
  }

  function closeShot() {
    if (!lb || !lb.classList.contains("is-open")) return;
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    lbImg.removeAttribute("src");
    document.body.classList.remove("is-locked");
    if (lbTrigger) lbTrigger.focus({ preventScroll: true });
  }

  function stepShot(dir) {
    if (!lb || !lb.classList.contains("is-open") || !shots.length) return;
    var next = (lbIndex + dir + shots.length) % shots.length;
    var guard = 0;
    while (shots[next].classList.contains("is-disabled") && guard < shots.length) {
      next = (next + dir + shots.length) % shots.length;
      guard++;
    }
    openShot(next);
  }

  if (lb && shots.length) {
    shots.forEach(function (btn, i) {
      btn.addEventListener("click", function () { openShot(i); });
    });
    lbCloseBtn.addEventListener("click", closeShot);
    lbPrevBtn.addEventListener("click", function () { stepShot(-1); });
    lbNextBtn.addEventListener("click", function () { stepShot(1); });
    lb.addEventListener("click", function (event) {
      if (event.target === lb) closeShot();
    });
    document.addEventListener("keydown", function (event) {
      if (!lb.classList.contains("is-open")) return;
      if (event.key === "Escape") closeShot();
      else if (event.key === "ArrowLeft") stepShot(-1);
      else if (event.key === "ArrowRight") stepShot(1);
    });
  }

  /* ============================================================
     7. CONTACT FORM (Formspree)
     ============================================================ */
  var form = document.getElementById("contactForm");
  var statusEl = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");
  var statusKey = null;
  var statusType = null;

  function showStatus(key, type) {
    statusKey = key;
    statusType = type || "success";
    if (!statusEl || !window.AttiaI18n) return;
    statusEl.textContent = window.AttiaI18n.t(key);
    statusEl.className = "form-status show is-" + (type || "success");
  }

  /* keeps the visible status in sync when the language changes */
  document.addEventListener("attia:lang", function () {
    if (statusKey && statusEl) {
      statusEl.textContent = window.AttiaI18n.t(statusKey);
      statusEl.className = "form-status show is-" + statusType;
    }
  });

  if (form && statusEl && submitBtn) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

      if (!name || !validEmail || !message) {
        showStatus("form.invalid", "error");
        (!name ? form.elements.name : !validEmail ? form.elements.email : form.elements.message).focus();
        return;
      }

      var fromMarkup = (form.getAttribute("action") || "").trim();
      var endpoint = fromMarkup && fromMarkup.indexOf("YOUR_FORM_ID") === -1 ? fromMarkup : FORMSPREE_ENDPOINT;
      if (!endpoint || endpoint.indexOf("YOUR_FORM_ID") !== -1) {
        showStatus("form.unconfigured", "warn");
        return;
      }

      var submitLabel = submitBtn.querySelector("span");
      submitLabel.textContent = window.AttiaI18n.t("form.sending");
      submitBtn.disabled = true;

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed: " + response.status);
          showStatus("form.success", "success");
          form.reset();
        })
        .catch(function () {
          showStatus("form.error", "error");
        })
        .then(function () {
          submitLabel.textContent = window.AttiaI18n.t("form.submit");
          submitBtn.disabled = false;
        });
    });
  }
})();
