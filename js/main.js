/* ==========================================================================
   Easy Plumbing FL — interactions
   Mobile menu, sticky-header state, active nav link, scroll reveal, quote form.
   ========================================================================== */
(() => {
  const root = document.documentElement;

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  const setNav = (open) => {
    root.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => setNav(!root.classList.contains("nav-open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && root.classList.contains("nav-open")) { setNav(false); toggle.focus(); }
    });
    matchMedia("(min-width: 1080px)").addEventListener("change", (e) => { if (e.matches) setNav(false); });
  }

  /* ---------- Header shadow once the page scrolls ---------- */
  const header = document.querySelector("[data-header]");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Active nav link + scroll reveal ---------- */
  const reveals = document.querySelectorAll("[data-reveal]");

  // Once revealed, drop the attribute so the element's own hover transitions take over again.
  const settle = (el) => {
    const done = () => { el.removeAttribute("data-reveal"); el.classList.remove("is-visible"); };
    el.addEventListener("transitionend", done, { once: true });
    setTimeout(done, 1500);
  };

  if ("IntersectionObserver" in window) {
    const links = [...document.querySelectorAll('.nav__list a[href^="#"]')];
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.hash === "#" + entry.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((a) => { const s = document.querySelector(a.hash); if (s) spy.observe(s); });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        settle(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.removeAttribute("data-reveal"));
  }

  /* ---------- "Get a quote" links focus the form ---------- */
  document.querySelectorAll('a[href="#quote"]').forEach((a) => {
    a.addEventListener("click", () => {
      setTimeout(() => document.getElementById("q-name")?.focus({ preventScroll: true }), 600);
    });
  });

  /* ---------- Quote form ---------- */
  const form = document.querySelector("[data-quote-form]");
  const formWrap = document.querySelector("[data-quote]");
  const success = document.querySelector("[data-quote-success]");

  if (form && formWrap && success) {
    const phone = form.elements.phone;
    const zip = form.elements.zip;

    // Format US numbers as the user types: (561) 954-6558
    phone.addEventListener("input", () => {
      const d = phone.value.replace(/\D/g, "").replace(/^1/, "").slice(0, 10);
      phone.value = d.length > 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
        : d.length > 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}`
        : d;
    });
    zip.addEventListener("input", () => { zip.value = zip.value.replace(/\D/g, "").slice(0, 5); });

    const rules = {
      name: (v) => v.trim().length >= 2 || "Please enter your name.",
      phone: (v) => v.replace(/\D/g, "").length === 10 || "Enter a 10-digit phone number.",
      zip: (v) => /^\d{5}$/.test(v) || "Enter a 5-digit ZIP code.",
      service: (v) => !!v || "Choose a service.",
    };

    const check = (name) => {
      const input = form.elements[name];
      const result = rules[name](input.value);
      const field = input.closest(".field");
      const ok = result === true;
      field.classList.toggle("is-invalid", !ok);
      input.setAttribute("aria-invalid", String(!ok));
      field.querySelector(".field__error").textContent = ok ? "" : result;
      return ok;
    };

    Object.keys(rules).forEach((name) => {
      const input = form.elements[name];
      input.addEventListener("blur", () => { if (input.value) check(name); });
      input.addEventListener("change", () => { if (input.closest(".is-invalid")) check(name); });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const invalid = Object.keys(rules).filter((name) => !check(name));
      if (invalid.length) { form.elements[invalid[0]].focus(); return; }

      // Showcase build: no backend. Hook a form service (Formspree, Web3Forms, etc.) in here.
      const data = Object.fromEntries(new FormData(form));
      success.querySelector('[data-out="name"]').textContent = data.name.trim().split(/\s+/)[0];
      success.querySelector('[data-out="phone"]').textContent = data.phone;
      formWrap.hidden = true;
      success.hidden = false;
      success.querySelector("button").focus();
    });

    success.querySelector("[data-quote-reset]").addEventListener("click", () => {
      form.reset();
      success.hidden = true;
      formWrap.hidden = false;
      form.elements.name.focus();
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
