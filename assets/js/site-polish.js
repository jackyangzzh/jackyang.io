// Progressive-enhancement polish: staggered scroll reveals and a copy-to-clipboard
// affordance on the email button. Both are optional extras — if this file never
// loads, the inline gate in <head> un-hides everything and the email button keeps
// its plain `mailto:` behaviour.
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

  /* ------------------------------------------------------- copy email address */

  const onDocumentClick = (event) => {
    const link = event.target.closest('a[href^="mailto:"]');
    if (!link) return;

    const address = link.getAttribute("href").slice(7).split("?")[0];
    if (!address) return;

    // Deliberately does NOT preventDefault: the mail client should still open for
    // people who have one. The copy is a safety net for those who don't, which is
    // otherwise a dead end on a `mailto:` link.
    if (!navigator.clipboard?.writeText) return;

    navigator.clipboard
      .writeText(address)
      .then(() => showToast(`${address} copied to clipboard`))
      .catch(() => {
        /* Clipboard blocked — the mailto: navigation still happens. */
      });
  };

  /* -------------------------------------------------------------------- init */

  const init = () => {
    setupReveal();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("click", onDocumentClick);

  // Hydejack swaps page content client-side, so freshly injected cards and
  // resume sections need to be observed again.
  if (pushState) {
    pushState.addEventListener("hy-push-state-after", setupReveal);
  }
})();
