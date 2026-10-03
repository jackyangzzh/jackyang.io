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

  /* ------------------------------------------------------------- sliding line */

  // After cult-ui's direction-aware tabs: a group of options shares one
  // mark, a line under the chosen one's words, that slides to whichever is
  // chosen, instead of each option marking itself. The line is the track's
  // ::before, placed by four inset properties; CSS owns its look and its
  // motion (see "Sliding line" in my-critical.scss). The edge facing the way
  // it travels sets off with the shorter duration and the trailing edge
  // takes longer, so the line draws out toward its destination and gathers
  // itself as it lands.
  //
  // Measured with offset* rather than getBoundingClientRect, so an option's
  // own hover lift or press scale never ends up in the geometry. Each track is
  // `position: relative` in CSS, which makes it its options' offsetParent.
  // A track only takes `has-bubble` once it has been measured, so without
  // script every option keeps its own active style.
  const BUBBLE_LAG_MS = 70;
  const bubbleTargets = new WeakMap();
  const bubbleTracks = new Set();
  let bubbleResizeObserver;

  const placeBubble = (track, target, animate) => {
    // Gone, or not laid out (the quick nav is display: none on desktop):
    // fade out where it stands. A ResizeObserver brings it back when the
    // target appears.
    if (!target || target.offsetParent !== track) {
      track.classList.add("bubble-hidden");
      return;
    }
    const style = track.style;
    const top = target.offsetTop;
    const left = target.offsetLeft;
    const right = track.clientWidth - left - target.offsetWidth;
    const bottom = track.clientHeight - top - target.offsetHeight;
    const lag = (trailing) => (trailing ? `${BUBBLE_LAG_MS}ms` : "0ms");
    const was = (name) => parseFloat(style.getPropertyValue(`--bubble-${name}`));
    const moving = animate && track.classList.contains("has-bubble");
    style.setProperty("--bubble-lag-left", lag(moving && left > was("left")));
    style.setProperty("--bubble-lag-right", lag(moving && right > was("right")));
    style.setProperty("--bubble-lag-top", lag(moving && top > was("top")));
    style.setProperty("--bubble-lag-bottom", lag(moving && bottom > was("bottom")));
    track.classList.toggle("bubble-instant", !animate);
    style.setProperty("--bubble-top", `${top}px`);
    style.setProperty("--bubble-right", `${right}px`);
    style.setProperty("--bubble-bottom", `${bottom}px`);
    style.setProperty("--bubble-left", `${left}px`);
    track.classList.add("has-bubble");
    track.classList.remove("bubble-hidden");
  };

  // Re-place without motion when anything in a track changes size: web fonts
  // arriving, the window crossing a breakpoint, the filter row wrapping.
  const observeBubbleTrack = (track) => {
    if (!("ResizeObserver" in window)) return;
    if (!bubbleResizeObserver) {
      bubbleResizeObserver = new ResizeObserver((entries) => {
        const tracks = new Set();
        for (const entry of entries) {
          const track = entry.target.closest(".bubble-track");
          if (track) tracks.add(track);
        }
        for (const track of tracks) placeBubble(track, bubbleTargets.get(track), false);
      });
    }
    if (bubbleTracks.has(track)) return;
    // A page swap throws away the filter row; stop watching the old one.
    for (const old of bubbleTracks) {
      if (old.isConnected) continue;
      bubbleResizeObserver.unobserve(old);
      for (const option of old.children) bubbleResizeObserver.unobserve(option);
      bubbleTracks.delete(old);
    }
    bubbleTracks.add(track);
    track.classList.add("bubble-track");
    bubbleResizeObserver.observe(track);
    for (const option of track.children) bubbleResizeObserver.observe(option);
  };

  // The option under the bubble is marked `bubble-target`, which is what CSS
  // keys its see-through state on. Not `aria-current`: during a page load the
  // bubble is already on the new link while that still names the old one.
  const moveBubble = (track, target, animate) => {
    if (!track) return;
    observeBubbleTrack(track);
    const previous = bubbleTargets.get(track);
    if (previous === target && track.classList.contains("has-bubble")) return;
    if (previous) previous.classList.remove("bubble-target");
    if (target) target.classList.add("bubble-target");
    bubbleTargets.set(track, target);
    placeBubble(track, target, animate);
  };

  /* --------------------------------------------------------------- navigation */

  const NAV_TRACKS = [
    [".sidebar-nav > ul", ".sidebar-nav-item"],
    [".quick-nav", ".quick-nav-link"],
  ];

  const normalizePath = (pathname) => pathname.replace(/\/$/, "") || "/";

  // "page" for the link to this very page, "location" for a section it sits
  // in (a project under Projects), or null.
  const navCurrent = (link, path) => {
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return null;
    const target = normalizePath(url.pathname);
    if (target === path) return "page";
    if (target !== "/" && path.startsWith(`${target}/`)) return "location";
    return null;
  };

  // Where each track's highlight belongs when nothing is being pointed at.
  const navHome = new WeakMap();

  const moveNavBubbles = (path, animate) => {
    for (const [trackSelector, linkSelector] of NAV_TRACKS) {
      const track = document.querySelector(trackSelector);
      if (!track) continue;
      const links = [...track.querySelectorAll(linkSelector)];
      const home = links.find((link) => navCurrent(link, path));
      navHome.set(track, home);
      moveBubble(track, home, animate);
    }
  };

  // After cult-ui's direction-aware tabs, whose highlight follows the
  // pointer: in the sidebar it slides to whichever link the pointer (or
  // keyboard focus) is on, and back to the current page's link when it
  // leaves. Touch has nothing to follow. The sidebar persists across page
  // swaps, so this is wired once.
  const setupNavFollow = () => {
    const track = document.querySelector(".sidebar-nav > ul");
    if (!track || track.dataset.followReady) return;
    track.dataset.followReady = "true";
    const linkAt = (target) => target instanceof Element && target.closest(".sidebar-nav-item");
    const goHome = () => moveBubble(track, navHome.get(track), true);

    track.addEventListener("pointerover", (event) => {
      const link = event.pointerType !== "touch" && linkAt(event.target);
      if (link) moveBubble(track, link, true);
    });
    track.addEventListener("pointerleave", (event) => {
      // Keyboard focus keeps it; a link merely clicked earlier does not.
      if (event.pointerType !== "touch" && !track.querySelector(":focus-visible")) goHome();
    });
    track.addEventListener("focusin", (event) => {
      const link = linkAt(event.target);
      if (link && link.matches(":focus-visible")) moveBubble(track, link, true);
    });
    track.addEventListener("focusout", (event) => {
      if (!track.contains(event.relatedTarget) && !track.matches(":hover")) goHome();
    });
  };

  const setupNavigation = () => {
    const path = normalizePath(location.pathname);
    for (const link of document.querySelectorAll(".sidebar-nav-item, .quick-nav-link")) {
      const current = navCurrent(link, path);
      if (current) link.setAttribute("aria-current", current);
      else link.removeAttribute("aria-current");
    }
    // Animated, so back and forward (which arrive here via popstate) slide
    // too. A first placement has no earlier position to slide from, and
    // after a push-state swap the bubble is already in place.
    moveNavBubbles(path, true);
  };

  // The sidebar and the top bar survive page swaps, so the highlight can
  // leave for the new page the moment it is requested rather than jumping
  // once it has loaded. setupNavigation then finds it already in place.
  const onNavigationStart = (event) => {
    const url = event.detail && event.detail.url;
    if (!url) return;
    try {
      moveNavBubbles(normalizePath(new URL(url, location.href).pathname), true);
    } catch {
      // Cosmetic only; setupNavigation still corrects it after the swap.
    }
  };

  /* ----------------------------------------------------------------- filters */

  const setupFilters = () => {
    const filters = document.querySelector(".project-filters");
    if (!filters) return;
    const buttons = [...filters.querySelectorAll("[data-filter]")];
    const items = [...document.querySelectorAll(".project-list .project-column")];
    const status = document.querySelector(".project-results");

    const applyFilter = (filter, animate) => {
      let count = 0;
      for (const button of buttons) {
        const active = button.dataset.filter === filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
        if (active) moveBubble(filters, button, animate);
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
    // Unhidden first: the highlight is measured against the laid-out pills.
    filters.hidden = false;
    applyFilter(buttons.some((button) => button.dataset.filter === requested) ? requested : "all", false);

    // A cached page may be initialized again; do not stack click handlers.
    if (filters.dataset.ready) return;
    filters.dataset.ready = "true";
    filters.addEventListener("click", (event) => {
      const button = event.target instanceof Element && event.target.closest("[data-filter]");
      if (!button) return;
      const filter = button.dataset.filter;
      runFilterTransition(filters, items, () => {
        applyFilter(filter, true);
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
  // theme switch) ever sees them. The filter row is named too and shown live,
  // so its sliding line is not cross-faded with a snapshot of itself.
  const runFilterTransition = (bar, items, update) => {
    if (!canTransition()) {
      update();
      return;
    }
    bar.style.viewTransitionName = "project-filters";
    items.forEach((item, index) => {
      item.style.viewTransitionName = `project-card-${index}`;
    });
    root.classList.add("is-filtering");
    const cleanUp = () => {
      root.classList.remove("is-filtering");
      bar.style.viewTransitionName = "";
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
      // ⌘K / Ctrl+K works everywhere, even mid-typing, as it does in apps.
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        togglePalette();
        return;
      }

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

  let deferredVideoObserver;

  const loadDeferredVideo = (video) => {
    if (video.dataset.deferredReady) return;
    video.dataset.deferredReady = "true";
    video.preload = "metadata";
    video.load();
    if (video.dataset.autoplay !== "true" || (reducedMotion && reducedMotion.matches)) return;
    const play = video.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
  };

  const setupDeferredVideos = () => {
    const videos = document.querySelectorAll("video[data-deferred-video]");
    if (deferredVideoObserver) deferredVideoObserver.disconnect();
    if (!videos.length) return;
    if (!("IntersectionObserver" in window)) {
      for (const video of videos) loadDeferredVideo(video);
      return;
    }
    deferredVideoObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          loadDeferredVideo(entry.target);
          deferredVideoObserver.unobserve(entry.target);
        }
      },
      { rootMargin: "200px" },
    );
    for (const video of videos) deferredVideoObserver.observe(video);
  };

  /* ------------------------------------------------------------- social dock */

  // After cult-ui's dock: the sidebar's social icons swell under the pointer
  // the way the macOS Dock does, the nearest one most and its neighbours a
  // little. Only the glyph inside each link scales, from its foot, so hit
  // areas and the row's layout never move; CSS smooths the steps (see
  // "Social dock" in my-style.scss). Mouse only: touch has no hover to follow.
  const DOCK_MAX_SCALE = 1.55;
  // Pixels: the spread of the swell either side of the pointer. Neighbours
  // sit 48px apart, so one under the pointer lifts the next to about 1.2.
  const DOCK_SPREAD = 36;

  const setupDock = () => {
    const row = document.querySelector(".sidebar-social > ul");
    // The sidebar persists across page swaps; wire it once.
    if (!row || row.dataset.dockReady) return;
    row.dataset.dockReady = "true";
    const links = [...row.querySelectorAll(":scope > li > a")];
    let frame = 0;
    let pointerX = 0;

    const swell = () => {
      frame = 0;
      for (const link of links) {
        const rect = link.getBoundingClientRect();
        const distance = pointerX - (rect.left + rect.width / 2);
        const reach = Math.exp(-(distance * distance) / (2 * DOCK_SPREAD * DOCK_SPREAD));
        link.style.setProperty("--dock-scale", (1 + (DOCK_MAX_SCALE - 1) * reach).toFixed(3));
      }
    };

    row.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" || (reducedMotion && reducedMotion.matches)) return;
      pointerX = event.clientX;
      row.classList.add("is-docking");
      if (!frame) frame = requestAnimationFrame(swell);
    });

    row.addEventListener("pointerleave", () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      row.classList.remove("is-docking");
      for (const link of links) link.style.removeProperty("--dock-scale");
    });
  };

  /* --------------------------------------------------------- cover scroll cue */

  // See "Cover scroll cue" in my-critical.scss. Added beside the theme's
  // swipe hand while the cover is open, and removed, as the theme removes
  // the hand, once it has opened; CSS decides which of the two shows.
  const setupCoverCue = () => {
    const drawer = document.getElementById("_drawer");
    const sidebar = document.getElementById("_sidebar");
    if (!drawer || !sidebar || !drawer.classList.contains("cover") || !drawer.hasAttribute("opened")) return;
    if (sidebar.querySelector(".cover-cue")) return;

    const cue = document.createElement("button");
    cue.type = "button";
    cue.className = "cover-cue";
    cue.innerHTML =
      '<span class="cover-cue__mouse" aria-hidden="true"><span class="cover-cue__wheel"></span></span>' +
      '<span aria-hidden="true">Scroll</span><span class="sr-only">Show the résumé</span>';
    cue.addEventListener("click", () => {
      if (typeof drawer.close === "function") drawer.close();
    });
    sidebar.appendChild(cue);
    drawer.addEventListener("hy-drawer-transitioned", (event) => {
      if (!event.detail) cue.remove();
    });
  };

  /* ------------------------------------------------------------ cover meteors */

  // Every so often a shooting star crosses the cover's sky: nothing to look
  // at on purpose, just a small reward for anyone who lingers. One at a time,
  // at a random height and angle, and only while the cover is open and the
  // tab is in view. The streak moves by transform and opacity only.
  const METEOR_FIRST_MS = 3500;
  const METEOR_GAP_MS = [7000, 15000];

  const launchMeteor = (sky) => {
    const meteor = document.createElement("span");
    meteor.className = "cover-meteor";
    meteor.setAttribute("aria-hidden", "true");
    const angle = 18 + Math.random() * 16;
    const length = 5 + Math.random() * 4;
    Object.assign(meteor.style, {
      top: `${4 + Math.random() * 38}%`,
      left: `${Math.random() * 55}%`,
      width: `${length}rem`,
    });
    sky.appendChild(meteor);
    const travel = Math.min(sky.clientWidth * 0.45, 520);
    const animation = meteor.animate(
      [
        { transform: `rotate(${angle}deg) translateX(0)`, opacity: 0 },
        { opacity: 1, offset: 0.2 },
        { transform: `rotate(${angle}deg) translateX(${travel}px)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.3, .1, .6, 1)" }
    );
    animation.onfinish = () => meteor.remove();
    animation.oncancel = () => meteor.remove();
  };

  const setupCoverMeteors = () => {
    const drawer = document.getElementById("_drawer");
    const sky = document.querySelector("#_drawer.cover .sidebar-bg");
    if (!drawer || !sky || sky.dataset.meteors || !drawer.hasAttribute("opened")) return;
    if ((reducedMotion && reducedMotion.matches) || typeof sky.animate !== "function") return;
    sky.dataset.meteors = "true";
    const [shortest, longest] = METEOR_GAP_MS;
    const next = () => {
      // The cover opens once; after that the sky is the sidebar's, so stop.
      if (!drawer.hasAttribute("opened")) return;
      if (!document.hidden) launchMeteor(sky);
      setTimeout(next, shortest + Math.random() * (longest - shortest));
    };
    setTimeout(next, METEOR_FIRST_MS);
  };

  /* -------------------------------------------------------------- site index */

  // assets/site-index.json: projects, recent writing and contact links, for
  // the project previews and the command menu. Fetched once, on first use,
  // with this script's own `?v=`, since /assets/* is served with a one-year
  // immutable cache and an unversioned URL would outlive the next build.
  const BUILD_QUERY = new URL(import.meta.url).search;
  let siteIndex;

  const loadSiteIndex = () => {
    siteIndex ||= fetch(new URL(`../site-index.json${BUILD_QUERY}`, import.meta.url))
      .then((response) => {
        if (!response.ok) throw new Error(`site index: ${response.status}`);
        return response.json();
      })
      .catch((error) => {
        // Let the next use try again rather than caching the failure.
        siteIndex = undefined;
        throw error;
      });
    return siteIndex;
  };

  /* -------------------------------------------------------- project previews */

  // After cult-ui's floating panel: pointing at (or tabbing to) a project name
  // in the résumé intro grows a small card out of the link, with the
  // project's artwork, years and one-line summary. A link that leaves the
  // site gets the same card without artwork, if _data/link_previews.yml has
  // an entry for it: the site's name and the page's own title and
  // description. Either way it repeats what is on the other side of the
  // link, so it is aria-hidden and never takes focus. It stays while the
  // pointer is on the link or on the card itself, so it can be reached and
  // clicked; Escape, scrolling or moving away put it away. Mouse and
  // keyboard only: on touch the link is simply a link. Intro links with
  // nothing to preview just never open a card.
  const PREVIEW_SELECTOR = ".resume-intro a[href]";
  const PREVIEW_SHOW_MS = 120;
  const PREVIEW_HIDE_MS = 160;
  // Space between the link and the card, and the card and the window edge.
  const PREVIEW_GAP = 10;
  const PREVIEW_MARGIN = 8;
  // Wait this long at most for the artwork to decode before opening.
  const PREVIEW_IMAGE_WAIT_MS = 250;
  const CATEGORY_LABELS = { professional: "Professional", personal: "Personal", research: "Research" };

  let peek;
  let peekLink = null;
  let peekTimer = 0;
  let peekToken = 0;

  const buildPeek = () => {
    peek = document.createElement("div");
    peek.className = "project-peek";
    peek.setAttribute("aria-hidden", "true");
    peek.innerHTML =
      '<div class="project-peek__art"><img alt="" width="480" height="270" decoding="async"></div>' +
      '<div class="project-peek__body">' +
      '<p class="project-peek__meta"><span class="project-tag"></span><span class="project-peek__years"></span></p>' +
      '<p class="project-peek__title"></p><p class="project-peek__text"></p></div>';
    // The card is a shortcut to the link it previews; the link keeps the
    // click, so the theme's page transition still runs.
    peek.addEventListener("click", () => {
      if (peekLink) peekLink.click();
    });
    document.body.appendChild(peek);
  };

  // A link that wraps onto two lines has two boxes; anchor to the one the
  // pointer is in, or the first for keyboard focus.
  const anchorRect = (link, x, y) => {
    const rects = [...link.getClientRects()];
    if (x !== undefined) {
      const hit = rects.find((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
      if (hit) return hit;
    }
    return rects[0] || link.getBoundingClientRect();
  };

  const placePeek = (rect) => {
    const width = peek.offsetWidth;
    const height = peek.offsetHeight;
    const fitsBelow = rect.bottom + PREVIEW_GAP + height <= innerHeight - PREVIEW_MARGIN;
    const fitsAbove = rect.top - PREVIEW_GAP - height >= PREVIEW_MARGIN;
    const below = fitsBelow || !fitsAbove;
    const center = rect.left + rect.width / 2;
    const left = Math.min(Math.max(PREVIEW_MARGIN, center - width / 2), innerWidth - width - PREVIEW_MARGIN);
    peek.style.left = `${Math.round(left)}px`;
    peek.style.top = `${Math.round(below ? rect.bottom + PREVIEW_GAP : rect.top - PREVIEW_GAP - height)}px`;
    // Grow out of the link.
    peek.style.transformOrigin = `${Math.round(center - left)}px ${below ? 0 : height}px`;
  };

  // What a link previews: one of the site's projects (by path), or an entry
  // from _data/link_previews.yml (by exact address, give or take a slash).
  const previewFor = (index, link) => {
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin) {
      const path = normalizePath(url.pathname);
      const project = index.projects.find((item) => normalizePath(item.url) === path);
      return project && { ...project, label: CATEGORY_LABELS[project.category] || project.category };
    }
    const href = url.href.replace(/\/$/, "");
    const external = (index.links || []).find((item) => item.url.replace(/\/$/, "") === href);
    return external && { ...external, category: "other", label: `${external.site} ↗`, years: "", image: "" };
  };

  const showPeek = async (link, rect) => {
    const token = ++peekToken;
    let preview;
    try {
      preview = previewFor(await loadSiteIndex(), link);
    } catch {
      return;
    }
    if (token !== peekToken || !link.isConnected) return;
    // Nothing to show for this link: put away the card for the last one.
    if (!preview) {
      hidePeek();
      return;
    }
    if (!peek) buildPeek();

    const img = peek.querySelector("img");
    peek.classList.toggle("is-link", !preview.image);
    if (preview.image && img.getAttribute("src") !== preview.image) img.src = preview.image;
    const tag = peek.querySelector(".project-tag");
    tag.className = `project-tag project-tag-${preview.category}`;
    tag.textContent = preview.label;
    peek.querySelector(".project-peek__years").textContent = preview.years;
    peek.querySelector(".project-peek__title").textContent = preview.title;
    peek.querySelector(".project-peek__text").textContent = preview.tagline;

    // Open with the artwork in place rather than popping in a beat later.
    if (preview.image) {
      await Promise.race([
        img.decode().catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, PREVIEW_IMAGE_WAIT_MS)),
      ]);
    }
    if (token !== peekToken || !link.isConnected) return;

    // Moving straight from one project name to another replays the grow.
    peek.classList.remove("is-open");
    placePeek(rect || anchorRect(link));
    void peek.offsetWidth;
    peekLink = link;
    peek.classList.add("is-open");
  };

  const hidePeek = () => {
    clearTimeout(peekTimer);
    peekTimer = 0;
    peekToken += 1;
    peekLink = null;
    if (peek) peek.classList.remove("is-open");
  };

  // One timer for both directions, so a pass across a link that never
  // settles on it cancels the show it scheduled.
  const schedulePeek = (fn, delay) => {
    clearTimeout(peekTimer);
    peekTimer = setTimeout(fn, delay);
  };

  const inPeekZone = (el) =>
    el instanceof Element && ((peek && peek.contains(el)) || Boolean(el.closest(PREVIEW_SELECTOR)));

  const onPeekPointerOver = (event) => {
    if (event.pointerType === "touch" || !(event.target instanceof Element)) return;
    if (peek && peek.contains(event.target)) {
      clearTimeout(peekTimer);
      return;
    }
    const link = event.target.closest(PREVIEW_SELECTOR);
    if (!link) return;
    if (link === peekLink) {
      clearTimeout(peekTimer);
      return;
    }
    // Warm the index while the hover intent delay runs.
    loadSiteIndex().catch(() => {});
    const { clientX: x, clientY: y } = event;
    schedulePeek(() => showPeek(link, anchorRect(link, x, y)), PREVIEW_SHOW_MS);
  };

  const onPeekPointerOut = (event) => {
    if (event.pointerType === "touch" || !inPeekZone(event.target)) return;
    // Within the link, from the link to the card, or back: nothing to do.
    // Over to another project name: its own pointerover takes the timer.
    if (inPeekZone(event.relatedTarget)) return;
    schedulePeek(hidePeek, PREVIEW_HIDE_MS);
  };

  const onPeekFocusIn = (event) => {
    const link = event.target instanceof Element && event.target.closest(PREVIEW_SELECTOR);
    if (!link || link === peekLink || !link.matches(":focus-visible")) return;
    clearTimeout(peekTimer);
    showPeek(link);
  };

  const onPeekFocusOut = (event) => {
    const link = event.target instanceof Element && event.target.closest(PREVIEW_SELECTOR);
    if (link && link === peekLink && !link.matches(":hover")) hidePeek();
  };

  const onPeekKeydown = (event) => {
    if (event.key === "Escape" && peekLink) hidePeek();
  };

  /* --------------------------------------------------------------- edge blur */

  // The top bar is frosted glass (see "Edge blur" in my-critical.scss). The
  // soft fade below it only appears once the page has scrolled, so at rest
  // nothing under the bar is ever blurred. Scrolling also puts a project
  // preview away, since it would otherwise drift off its link.
  let scrollTicking = false;

  const updateScrolled = () => {
    scrollTicking = false;
    root.classList.toggle("is-scrolled", window.scrollY > 2);
  };

  const onScroll = () => {
    if (peekLink) hidePeek();
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateScrolled);
    }
  };

  /* ------------------------------------------------------------ 404 terminal */

  // After cult-ui's typewriter: on the 404 page a prompt in the corner of the
  // night sky types `cd` to the address that was asked for, and the shell
  // answers the way a shell would, then waits at a fresh prompt. It is part
  // of the decorative sky (aria-hidden; the heading says what happened).
  // With reduced motion the whole exchange is simply there.
  const TERMINAL_START_MS = 700;
  const TERMINAL_KEY_MS = [45, 95];
  const TERMINAL_ENTER_MS = 420;
  const TERMINAL_MAX_PATH = 34;

  const terminalPath = () => {
    let path = location.pathname;
    try {
      path = decodeURIComponent(path);
    } catch {
      // A malformed escape: show it as it was typed.
    }
    return path.length > TERMINAL_MAX_PATH ? `${path.slice(0, TERMINAL_MAX_PATH - 1)}…` : path;
  };

  const setupLostTerminal = () => {
    const terminal = document.querySelector(".lost-sky__terminal");
    if (!terminal || terminal.dataset.typed) return;
    terminal.dataset.typed = "true";
    const typed = terminal.querySelector("[data-terminal-input]");
    const answer = terminal.querySelector("[data-terminal-output]");
    const next = terminal.querySelector("[data-terminal-next]");
    const caret = terminal.querySelector(".lost-sky__caret");
    const command = `cd ${terminalPath()}`;

    const finish = () => {
      typed.textContent = command;
      answer.hidden = false;
      next.hidden = false;
      next.appendChild(caret);
      terminal.classList.remove("is-typing");
    };

    terminal.classList.add("is-ready");
    if ((reducedMotion && reducedMotion.matches) || !typed || !answer || !next || !caret) {
      finish();
      return;
    }

    let shown = 0;
    const [fast, slow] = TERMINAL_KEY_MS;
    const key = () => {
      if (!terminal.isConnected) return;
      shown += 1;
      typed.textContent = command.slice(0, shown);
      if (shown < command.length) setTimeout(key, fast + Math.random() * (slow - fast));
      else setTimeout(() => terminal.isConnected && finish(), TERMINAL_ENTER_MS);
    };
    setTimeout(() => {
      terminal.classList.add("is-typing");
      key();
    }, TERMINAL_START_MS);
  };

  /* ------------------------------------------------------------ command menu */

  // ⌘K (Ctrl+K elsewhere), or the key hint in the top bar, opens a command
  // menu: pages, projects, recent writing, copy email, switch theme, the
  // résumé PDF, profiles, and a hand-off to the site search. The menu lives
  // in assets/js/command-palette.js and is fetched on first use, so it costs
  // nothing until someone reaches for it.
  // `userAgentData` says "macOS", `navigator.platform` "MacIntel".
  const isMac = /mac|iphone|ipad/i.test(
    (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || ""
  );
  let palette;

  const togglePalette = () => {
    palette ||= import(new URL(`command-palette.js${BUILD_QUERY}`, import.meta.url).href).catch((error) => {
      palette = undefined;
      throw error;
    });
    palette
      .then((module) => module.toggle({ loadSiteIndex, pushState, reducedMotion }))
      .catch(() => {});
  };

  const setupPaletteTrigger = () => {
    for (const button of document.querySelectorAll("[data-command-palette]")) {
      if (button.dataset.ready) continue;
      button.dataset.ready = "true";
      const mod = button.querySelector("[data-command-palette-mod]");
      if (mod) mod.textContent = isMac ? "⌘" : "Ctrl ";
      button.setAttribute("aria-keyshortcuts", isMac ? "Meta+K" : "Control+K");
      button.hidden = false;
    }
  };

  const onPaletteTriggerClick = (event) => {
    if (event.target instanceof Element && event.target.closest("[data-command-palette]")) togglePalette();
  };

  /* ------------------------------------------------------------ footer heart */

  // The easter egg: the heart in "Built with ♥ in Seattle" beats and throws
  // off a small burst of stars and hearts, the night sky's stars in the
  // accent colours. Particles are fixed to the viewport, move by transform
  // and opacity only, and remove themselves; a cap keeps a flurry of clicks
  // from piling up hundreds. With reduced motion the heart only changes
  // colour for a moment.
  const SVG_NS = "http://www.w3.org/2000/svg";
  const HEART_PATH =
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
  const STAR_PATH = "M12 1.5 14.6 9.4 22.5 12 14.6 14.6 12 22.5 9.4 14.6 1.5 12 9.4 9.4Z";
  // Saturated enough to read on the white page and the dark one alike: the
  // theme accent, a mid lavender, a pink for the hearts and a warm gold for
  // the odd star.
  const SPARK_COLORS = ["var(--accent-strong)", "#9d74e6", "#e2609c", "#e8a93a"];
  const SPARKS_PER_BURST = 14;
  const MAX_LIVE_SPARKS = 90;
  let liveSparks = 0;

  const launchSpark = (x, y) => {
    const isHeart = Math.random() < 0.4;
    const size = (isHeart ? 11 : 9) + Math.random() * 9;
    const spark = document.createElementNS(SVG_NS, "svg");
    const path = document.createElementNS(SVG_NS, "path");
    spark.setAttribute("viewBox", "0 0 24 24");
    spark.setAttribute("aria-hidden", "true");
    spark.classList.add("love-spark");
    path.setAttribute("d", isHeart ? HEART_PATH : STAR_PATH);
    spark.appendChild(path);
    Object.assign(spark.style, {
      width: `${size}px`,
      height: `${size}px`,
      left: `${x - size / 2}px`,
      top: `${y - size / 2}px`,
      color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
    });
    document.body.appendChild(spark);
    liveSparks += 1;

    // An upward fan, so the burst rises off the footer instead of spraying
    // into the bottom edge of the screen.
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25;
    const distance = 38 + Math.random() * 58;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const spin = (Math.random() - 0.5) * 160;
    const animation = spark.animate(
      [
        { transform: "translate(0, 0) scale(.3) rotate(0deg)", opacity: 0 },
        { transform: `translate(${dx * 0.65}px, ${dy * 0.65}px) scale(1) rotate(${spin / 2}deg)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${dx}px, ${dy - 22}px) scale(.55) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: 750 + Math.random() * 450, delay: Math.random() * 70, easing: "cubic-bezier(.2, .7, .3, 1)" }
    );
    const done = () => {
      spark.remove();
      liveSparks -= 1;
    };
    animation.onfinish = done;
    animation.oncancel = done;
  };

  const onHeartClick = (event) => {
    const heart = event.target instanceof Element && event.target.closest(".footer-heart");
    if (!heart) return;

    if ((reducedMotion && reducedMotion.matches) || typeof heart.animate !== "function") {
      heart.classList.add("is-loved");
      window.setTimeout(() => heart.classList.remove("is-loved"), 700);
      return;
    }

    const icon = heart.querySelector("svg") || heart;
    icon.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.4)" }, { transform: "scale(.92)" }, { transform: "scale(1)" }],
      { duration: 460, easing: "ease-out" }
    );

    const rect = heart.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const count = Math.min(SPARKS_PER_BURST, MAX_LIVE_SPARKS - liveSparks);
    for (let i = 0; i < count; i += 1) launchSpark(x, y);
  };

  // A hello for anyone who opens the console, and a hint at the heart.
  const greetConsole = () => {
    console.log("%c✦ Hi there!", "font: 700 15px/1.6 system-ui, sans-serif; color: #875acd;");
    console.log(
      "Thanks for looking under the hood! If you want to talk about real-time AI agents, " +
        "I'd love to hear from you: jackyangzzh@gmail.com\n\nP.S. The heart in the footer does something." +
        `\nP.P.S. ${isMac ? "⌘K" : "Ctrl+K"} gets you anywhere on the site.`
    );
  };

  const init = () => {
    hidePeek();
    setupNavigation();
    setupFilters();
    setupCopyEmail();
    setupReveal();
    setupReadingProgress();
    setupKeyboardShortcuts();
    setupVideoPosters();
    setupDeferredVideos();
    setupDock();
    setupPaletteTrigger();
    setupLostTerminal();
    setupNavFollow();
    setupCoverCue();
    setupCoverMeteors();
    updateScrolled();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  greetConsole();

  document.addEventListener("click", onDocumentClick);
  document.addEventListener("click", onVideoPosterClick);
  document.addEventListener("click", onHeartClick);
  document.addEventListener("click", onPaletteTriggerClick);
  // Capture phase, so the theme's own handler on the button runs only on the
  // replayed click inside the transition.
  document.addEventListener("click", onThemeToggleClick, true);

  document.addEventListener("pointerover", onPeekPointerOver);
  document.addEventListener("pointerout", onPeekPointerOut);
  document.addEventListener("focusin", onPeekFocusIn);
  document.addEventListener("focusout", onPeekFocusOut);
  document.addEventListener("keydown", onPeekKeydown);
  window.addEventListener("scroll", onScroll, { passive: true });

  // The sidebar and toolbar persist while the main content is replaced.
  if (pushState) {
    pushState.addEventListener("hy-push-state-start", (event) => {
      hidePeek();
      onNavigationStart(event);
    });
    pushState.addEventListener("hy-push-state-after", init);
  }
  window.addEventListener("popstate", init);
})();
