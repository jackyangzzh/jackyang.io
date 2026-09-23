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

  // Opt in at SETUP time, using viewport geometry, not a blanket <head> gate:
  // a target is given `reveal-pending` (the only thing CSS hides) only when it
  // lies entirely below the viewport at that moment. A target that was visible
  // once is marked `reveal-seen` and is never re-hidden by a later init pass.
  // First-screen content is therefore always painted at full opacity. Without
  // script or the class the content is simply visible, so no-JS needs nothing.
  const PENDING_CLASS = "reveal-pending";
  const SEEN_CLASS = "reveal-seen";

  let observer;
  const reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");

  const revealNow = (el, delay) => {
    el.style.setProperty("--reveal-delay", `${delay}ms`);
    el.classList.remove(PENDING_CLASS);
    el.classList.add("is-in");
  };

  // Show without a fresh fade: for targets that were already pending but are
  // now visible (or scrolled past) when init runs again, and for targets that
  // start out visible and must never be opted in later.
  const markSeen = (el) => {
    el.classList.remove(PENDING_CLASS);
    el.classList.add(SEEN_CLASS);
  };

  // Last resort if opt-in failed halfway through: nothing may stay hidden.
  const revealAllPending = () => {
    for (const el of document.querySelectorAll(`.${PENDING_CLASS}`)) revealNow(el, 0);
  };

  const setupReveal = () => {
    if (observer) observer.disconnect();

    if ((reducedMotion && reducedMotion.matches) || !("IntersectionObserver" in window)) {
      revealAllPending();
      return;
    }

    let targets;
    try {
      targets = document.querySelectorAll(REVEAL_SELECTOR);
      if (!targets.length) return;

      observer = new IntersectionObserver(
        (entries) => {
          // Stagger within a batch: items scrolled to arrive one at a time.
          let step = 0;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            observer.unobserve(entry.target);
            revealNow(entry.target, step * STAGGER_MS);
            step += 1;
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
      );

      // Read geometry before class changes to avoid repeated synchronous
      // style/layout work; batching the reads also keeps the writes from
      // creating layout-thrash between them.
      const fold = root.clientHeight;
      const measured = [];
      for (const el of targets) {
        // Seen targets stay visible; nothing to do on a repeat init.
        if (el.classList.contains(SEEN_CLASS) || el.classList.contains("is-in")) continue;
        const rect = el.getBoundingClientRect();
        const inOrPastViewport = rect.bottom <= 0 || (rect.top < fold && rect.bottom > 0);
        measured.push({ el, inOrPastViewport });
      }

      // Writes only: opt in, reveal, or register with the fresh observer.
      for (const { el, inOrPastViewport } of measured) {
        if (el.classList.contains(PENDING_CLASS)) {
          // Hidden earlier by a previous pass; re-measure from phase A. Still
          // below the fold: keep it waiting (re-observe a fresh observer). No
          // longer below the fold — entered the viewport or been scrolled past
          // while hidden: show immediately, without a fresh fade, mark seen.
          if (inOrPastViewport) markSeen(el);
          else observer.observe(el);
          continue;
        }

        if (inOrPastViewport) {
          // Never hide anything the visitor can already see.
          markSeen(el);
        } else {
          el.classList.add(PENDING_CLASS);
          observer.observe(el);
        }
      }
    } catch {
      revealAllPending();
      if (observer) observer.disconnect();
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
      runFilterTransition(items, () => {
        applyFilter(filter);
        setupReveal();
      });
      const url = new URL(location.href);
      if (filter === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", filter);
      // Keep the selection shareable without reloading or adding a history entry
      // for each button press. Preserve the theme's own history-state data.
      history.replaceState(history.state, "", url);
    });
  };

  /* ------------------------------------------------------- view transitions */

  const canTransition = () =>
    typeof document.startViewTransition === "function" && !(reducedMotion && reducedMotion.matches);

  // Cards that stay glide to their new slots; the rest shrink out or grow in
  // (see "Project filters" in my-style.scss). Every card gets a unique name
  // only for the life of the transition, so no other view transition (the
  // theme switch) ever sees them.
  const runFilterTransition = (items, update) => {
    if (!canTransition()) {
      update();
      return;
    }
    items.forEach((item, index) => {
      item.style.viewTransitionName = `project-card-${index}`;
    });
    root.classList.add("is-filtering");
    const cleanUp = () => {
      root.classList.remove("is-filtering");
      for (const item of items) item.style.viewTransitionName = "";
    };
    try {
      document.startViewTransition(update).finished.finally(cleanUp);
    } catch {
      cleanUp();
      update();
    }
  };

  // The theme's toggle flips body classes synchronously in its own click
  // handler. Catch the click first, start a view transition, and replay the
  // click inside it, so the theme still owns the switch (and the `t` shortcut,
  // which clicks the same button, gets the effect for free). The new scheme is
  // then revealed as a circle growing out of the button.
  let themeClickReplay = false;
  const onThemeToggleClick = (event) => {
    if (themeClickReplay || !canTransition()) return;
    const button = event.target instanceof Element && event.target.closest("#_dark-mode");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    root.classList.add("is-theme-switching");
    const transition = document.startViewTransition(() => {
      themeClickReplay = true;
      try {
        button.click();
      } finally {
        themeClickReplay = false;
      }
    });
    transition.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 560, easing: "cubic-bezier(.4, 0, .2, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      })
      .catch(() => {});
    transition.finished.finally(() => root.classList.remove("is-theme-switching"));
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

  /* -------------------------------------------------------- reading progress */

  let progressTicking = false;
  const updateReadingProgress = () => {
    progressTicking = false;
    const bar = document.getElementById("reading-progress");
    if (!bar) return;
    const scrollH = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollH <= 0) {
      bar.style.width = "0%";
      return;
    }
    const percent = Math.min(100, Math.max(0, (window.scrollY / scrollH) * 100));
    bar.style.width = `${percent.toFixed(1)}%`;
  };

  const setupReadingProgress = () => {
    const bar = document.getElementById("reading-progress");
    if (!bar) return;
    if (reducedMotion && reducedMotion.matches) {
      bar.style.display = "none";
      return;
    }
    bar.style.display = "block";
    updateReadingProgress();
    if (!window.__readingProgressReady) {
      window.__readingProgressReady = true;
      window.addEventListener(
        "scroll",
        () => {
          if (!progressTicking) {
            requestAnimationFrame(updateReadingProgress);
            progressTicking = true;
          }
        },
        { passive: true }
      );
    }
  };

  /* ------------------------------------------------------- keyboard shortcuts */

  const setupKeyboardShortcuts = () => {
    if (window.__shortcutsReady) return;
    window.__shortcutsReady = true;

    window.addEventListener("keydown", (event) => {
      // Don't intercept when user is typing or using modifier keys
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "/") {
        const searchBtn = document.getElementById("_search");
        if (searchBtn) {
          event.preventDefault();
          searchBtn.click();
        }
      } else if (event.key === "t" || event.key === "T") {
        const darkModeBtn = document.getElementById("_dark-mode");
        if (darkModeBtn) {
          event.preventDefault();
          darkModeBtn.click();
        }
      }
    });
  };

  /* ---------------------------------------------------------- card spotlight */

  const setupCardSpotlight = () => {
    if ((reducedMotion && reducedMotion.matches) || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)) return;
    const cards = document.querySelectorAll(".project-card, .post-card");
    for (const card of cards) {
      if (card.dataset.spotlightReady) continue;
      card.dataset.spotlightReady = "true";
      card.addEventListener(
        "pointermove",
        (event) => {
          const rect = card.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          card.style.setProperty("--mouse-x", `${x.toFixed(1)}px`);
          card.style.setProperty("--mouse-y", `${y.toFixed(1)}px`);
        },
        { passive: true }
      );
    }
  };

  /* ------------------------------------------------------------ video posters */

  // YouTube serves a 120px grey placeholder (not an error) when a video has
  // no high-resolution thumbnail; either way, fall back to the one that
  // always exists.
  const setupVideoPosters = () => {
    for (const poster of document.querySelectorAll(".video-poster[data-video-id]")) {
      const img = poster.querySelector(".video-poster__thumb");
      if (!img || img.dataset.fallbackReady) continue;
      img.dataset.fallbackReady = "true";
      const fallback = () => {
        if (img.dataset.fellBack) return;
        img.dataset.fellBack = "true";
        img.removeAttribute("srcset");
        img.src = `https://i.ytimg.com/vi/${encodeURIComponent(poster.dataset.videoId)}/hqdefault.jpg`;
      };
      const check = () => {
        if (img.naturalWidth > 0 && img.naturalWidth <= 120) fallback();
      };
      img.addEventListener("error", fallback);
      img.addEventListener("load", check);
      if (img.complete) check();
    }
  };

  // Swap the poster for the real player. Modified clicks (new tab, new window)
  // keep the link's own behaviour and open the video on YouTube.
  const onVideoPosterClick = (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const poster = event.target instanceof Element && event.target.closest(".video-poster[data-video-id]");
    if (!poster) return;
    event.preventDefault();
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(poster.dataset.videoId)}?autoplay=1&rel=0&playsinline=1`;
    iframe.title = poster.dataset.videoTitle || "Video";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    poster.parentElement.classList.add("is-playing");
    poster.replaceWith(iframe);
    iframe.focus();
  };

  /* -------------------------------------------------------------------- init */

  const init = () => {
    setupNavigation();
    setupFilters();
    setupCopyEmail();
    setupReveal();
    setupReadingProgress();
    setupKeyboardShortcuts();
    setupCardSpotlight();
    setupVideoPosters();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("click", onDocumentClick);
  document.addEventListener("click", onVideoPosterClick);
  // Capture phase, so the theme's own handler on the button runs only on the
  // replayed click inside the transition.
  document.addEventListener("click", onThemeToggleClick, true);

  // The sidebar and toolbar persist while the main content is replaced.
  if (pushState) {
    pushState.addEventListener("hy-push-state-after", init);
  }
  window.addEventListener("popstate", init);
})();
