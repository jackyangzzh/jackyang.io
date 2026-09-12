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

  // How long the button holds its confirmed state before settling back.
  const COPY_FEEDBACK_MS = 1900;
  // Emptying the live region and refilling it a tick later is what makes a
  // screen reader speak the same sentence again after a second click.
  const ANNOUNCE_DELAY_MS = 80;
  const COPY_DONE_MESSAGE = "Email address copied to clipboard";
  const COPY_FAIL_MESSAGE =
    "Couldn’t copy automatically. The email address is now selected — press Control or Command plus C to copy it.";

  // Per-button bookkeeping. A WeakMap so the entry dies with the button when a
  // page swap replaces the markup.
  const copyState = new WeakMap();
  // Every timeout this section starts, so a page swap can cancel the ones whose
  // elements are about to be thrown away.
  const copyTimers = new Set();
  // Only ever set if a page uses the button without shipping a live region.
  let fallbackStatus;

  const copyStateFor = (button) => {
    let state = copyState.get(button);
    if (!state) {
      state = { reset: 0, announce: 0, clicks: 0 };
      copyState.set(button, state);
    }
    return state;
  };

  const copyLater = (fn, delay) => {
    const id = setTimeout(() => {
      copyTimers.delete(id);
      fn();
    }, delay);
    copyTimers.add(id);
    return id;
  };

  // Returns 0 so the caller can clear the field it was holding, rather than
  // keeping a fired id around for later no-op clearTimeout calls.
  const cancelCopyTimer = (id) => {
    if (id) {
      clearTimeout(id);
      copyTimers.delete(id);
    }
    return 0;
  };

  const clearCopyTimers = () => {
    for (const id of copyTimers) clearTimeout(id);
    copyTimers.clear();
  };

  const statusRegion = () => document.querySelector("[data-copy-status]");

  // `state` is "is-copied", "is-failed", or "" to settle back.
  const setCopyState = (button, state) => {
    const timers = copyStateFor(button);
    timers.reset = cancelCopyTimer(timers.reset);
    button.classList.remove("is-copied", "is-failed");
    if (!state) return;
    // Force a reflow so a repeat click replays the fill and the check draw from
    // the top instead of leaving the finished ones in place.
    void button.offsetWidth;
    button.classList.add(state);
    timers.reset = copyLater(() => setCopyState(button, ""), COPY_FEEDBACK_MS);
  };

  const announceCopy = (button, message) => {
    const region = statusRegion();
    if (!region) return;
    const timers = copyStateFor(button);
    timers.announce = cancelCopyTimer(timers.announce);
    region.textContent = "";
    timers.announce = copyLater(() => {
      // A page swap during the gap would leave this node detached, where
      // writing to it announces nothing and only holds the node alive.
      if (region.isConnected) region.textContent = message;
    }, ANNOUNCE_DELAY_MS);
  };

  // Clipboard access can be refused. Leaving the address selected turns the
  // fallback into one keystroke instead of a hunt.
  const selectEmailAddress = (button) => {
    const link = button.parentElement?.querySelector(".email, [href^='mailto:']");
    if (!link) return;
    try {
      const selection = window.getSelection();
      if (!selection) return;
      const range = document.createRange();
      range.selectNodeContents(link);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch {
      // Selecting is a convenience; the announcement already says what to do.
    }
  };

  const failCopy = (button) => {
    selectEmailAddress(button);
    setCopyState(button, "is-failed");
    announceCopy(button, COPY_FAIL_MESSAGE);
  };

  const setupCopyEmail = () => {
    // Anything still pending belongs to markup this page swap just replaced.
    clearCopyTimers();
    if (!navigator.clipboard?.writeText) return;
    const buttons = document.querySelectorAll("[data-copy-email]");
    if (!buttons.length) return;

    for (const button of buttons) {
      // Fresh markup should never arrive mid-confirmation.
      button.classList.remove("is-copied", "is-failed");
      button.hidden = false;
    }

    let region = statusRegion();
    if (!region) {
      // The include ships the live region; this only covers the button being
      // reused somewhere that does not. Created at setup, never at click time,
      // so assistive tech has it registered before there is anything to say.
      // Recreated if an earlier one was detached by a page swap.
      if (!fallbackStatus || !document.body.contains(fallbackStatus)) {
        fallbackStatus = document.createElement("span");
        fallbackStatus.className = "copy-email-status";
        fallbackStatus.setAttribute("role", "status");
        fallbackStatus.setAttribute("aria-live", "polite");
        fallbackStatus.setAttribute("aria-atomic", "true");
        fallbackStatus.setAttribute("data-copy-status", "");
        document.body.appendChild(fallbackStatus);
      }
      region = fallbackStatus;
    }
    region.textContent = "";
  };

  const onDocumentClick = (event) => {
    const button = event.target instanceof Element && event.target.closest("[data-copy-email]");
    if (!button || !navigator.clipboard?.writeText) return;
    const timers = copyStateFor(button);
    const click = (timers.clicks += 1);

    let written;
    try {
      // writeText can reject, but in hardened contexts it can also throw
      // synchronously, which would escape this delegated handler uncaught.
      written = navigator.clipboard.writeText(button.dataset.copyEmail || "");
    } catch {
      failCopy(button);
      return;
    }

    Promise.resolve(written).then(
      () => {
        // Two clicks can settle out of order; only the newest one gets to talk.
        if (timers.clicks !== click) return;
        setCopyState(button, "is-copied");
        announceCopy(button, COPY_DONE_MESSAGE);
      },
      () => {
        if (timers.clicks !== click) return;
        failCopy(button);
      }
    );
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
