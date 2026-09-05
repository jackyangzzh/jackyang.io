// Progressive enhancements for both initial loads and Hydejack page swaps.
// Without JavaScript, all content remains readable and ordinary links still work.
(() => {
  "use strict";

  const root = document.documentElement;
  const pushState = document.getElementById("_pushState");

  const REVEAL_SELECTOR = [
    ".project-card",
    ".post-card",
    ".layout-resume .column > section",
  ].join(", ");

  const STAGGER_MS = 60;

  /* ------------------------------------------------------------------ reveal */

  let observer;

  const setupReveal = () => {
    // The <head> gate only adds `reveal-on` when motion is allowed and
    // IntersectionObserver exists, so this doubles as the feature check.
    if (!root.classList.contains("reveal-on")) return;

    // We made it, so the "un-hide everything" failsafe is no longer needed.
    if (window.__revealFailsafe) {
      clearTimeout(window.__revealFailsafe);
      window.__revealFailsafe = null;
    }

    if (observer) observer.disconnect();

    const targets = document.querySelectorAll(REVEAL_SELECTOR);
    if (!targets.length) return;

    observer = new IntersectionObserver(
      (entries) => {
        // Stagger within a batch: everything already on screen at load animates
        // in sequence, while items scrolled to later arrive one at a time.
        let step = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          observer.unobserve(el);
          el.style.setProperty("--reveal-delay", `${step * STAGGER_MS}ms`);
          step += 1;
          el.classList.add("is-in");
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    for (const el of targets) {
      if (!el.classList.contains("is-in")) observer.observe(el);
    }
  };

  /* ------------------------------------------------------------------- toast */

  let toastNode;
  let toastTimer;

  const showToast = (message) => {
    if (!toastNode) {
      toastNode = document.createElement("div");
      toastNode.className = "site-toast";
      // polite + status so the confirmation is announced without stealing focus.
      toastNode.setAttribute("role", "status");
      toastNode.setAttribute("aria-live", "polite");
      document.body.appendChild(toastNode);
    }

    toastNode.textContent = message;
    // Restart the entry animation even if a toast is already on screen.
    toastNode.classList.remove("is-visible");
    void toastNode.offsetWidth;
    toastNode.classList.add("is-visible");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNode.classList.remove("is-visible");
    }, 2600);
  };

  /* --------------------------------------------------------------- navigation */

  const setupNavigation = () => {
    const path = location.pathname.replace(/\/$/, "") || "/";
    for (const link of document.querySelectorAll(".sidebar-nav-item, .quick-nav-link")) {
      const url = new URL(link.href, location.href);
      const target = url.pathname.replace(/\/$/, "") || "/";
      link.removeAttribute("aria-current");
      if (url.origin !== location.origin) continue;
      if (target === path) link.setAttribute("aria-current", "page");
      else if (target !== "/" && path.startsWith(`${target}/`)) {
        link.setAttribute("aria-current", "location");
      }
    }
  };

  /* ----------------------------------------------------------------- filters */

  const setupFilters = () => {
    const filters = document.querySelector(".project-filters");
    if (!filters) return;
    const buttons = [...filters.querySelectorAll("[data-filter]")];
    const items = [...document.querySelectorAll(".project-list .project-column")];
    const status = document.querySelector(".project-results");

    const applyFilter = (filter) => {
      let count = 0;
      for (const button of buttons) {
        const active = button.dataset.filter === filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      }
      for (const item of items) {
        const match = filter === "all" || item.dataset.category === filter;
        item.hidden = !match;
        item.classList.toggle("project-hidden", !match);
        if (match) count += 1;
      }
      if (status) {
        const category = filter === "all" ? "" : `${filter} `;
        status.textContent = `Showing ${filter === "all" ? "all " : ""}${count} ${category}project${count === 1 ? "" : "s"}`;
      }
    };

    const requested = new URL(location.href).searchParams.get("category");
    applyFilter(buttons.some((button) => button.dataset.filter === requested) ? requested : "all");
    filters.hidden = false;

    // A cached page may be initialized again; do not stack click handlers.
    if (filters.dataset.ready) return;
    filters.dataset.ready = "true";
    filters.addEventListener("click", (event) => {
      const button = event.target instanceof Element && event.target.closest("[data-filter]");
      if (!button) return;
      const filter = button.dataset.filter;
      applyFilter(filter);
      const url = new URL(location.href);
      if (filter === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", filter);
      // Keep the selection shareable without reloading or adding a history entry
      // for each button press. Preserve the theme's own history-state data.
      history.replaceState(history.state, "", url);
      setupReveal();
    });
  };

  /* ------------------------------------------------------- copy email address */

  const setupCopyEmail = () => {
    if (!navigator.clipboard?.writeText) return;
    for (const button of document.querySelectorAll("[data-copy-email]")) {
      button.hidden = false;
    }
  };

  const onDocumentClick = (event) => {
    const button = event.target instanceof Element && event.target.closest("[data-copy-email]");
    if (!button || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(button.dataset.copyEmail)
      .then(() => showToast("Email address copied"))
      .catch(() => {
        showToast("Couldn’t copy. Select the email address to copy it manually.");
      });
  };

  /* -------------------------------------------------------------------- init */

  const init = () => {
    setupNavigation();
    setupFilters();
    setupCopyEmail();
    setupReveal();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("click", onDocumentClick);

  // The sidebar and toolbar persist while the main content is replaced.
  if (pushState) {
    pushState.addEventListener("hy-push-state-after", init);
  }
  window.addEventListener("popstate", init);
})();
