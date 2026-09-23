(() => {
  const pushState = document.getElementById("_pushState");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
  // A clone is only removed once the new page has arrived and the morph has
  // run. Hydejack fires `-error` / `-networkerror` instead of `-after` when a
  // page fails to load (a dev server mid-rebuild, a dropped connection), and
  // the clone used to stay pinned over the error page. Those events now fade
  // it out, and a watchdog does the same for anything unforeseen: no page
  // swap within STALE_MS of the click, or no finished morph within SETTLE_MS
  // of it starting.
  const STALE_MS = 5000;
  const SETTLE_MS = 2500;
  let activeTransition;

  if (!pushState || typeof Element.prototype.animate !== "function") return;

  const removeTransition = () => {
    if (!activeTransition) return;
    window.clearTimeout(activeTransition.watchdog);
    activeTransition.target?.classList.remove("project-transition-target");
    activeTransition.clone.remove();
    activeTransition = undefined;
  };

  const fadeOutTransition = () => {
    const transition = activeTransition;
    if (!transition) return;
    activeTransition = undefined;
    window.clearTimeout(transition.watchdog);
    transition.target?.classList.remove("project-transition-target");
    const done = () => transition.clone.remove();
    transition.clone
      .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-out", fill: "forwards" })
      .finished.then(done, done);
  };

  const armWatchdog = (transition, ms) => {
    window.clearTimeout(transition.watchdog);
    transition.watchdog = window.setTimeout(() => {
      if (activeTransition === transition) fadeOutTransition();
    }, ms);
  };

  const finalRect = (element) => {
    const rect = element.getBoundingClientRect();
    let translateX = 0;
    let translateY = 0;

    for (let node = element.parentElement; node; node = node.parentElement) {
      const transform = getComputedStyle(node).transform;
      if (transform === "none") continue;
      const matrix = new DOMMatrixReadOnly(transform);
      translateX += matrix.m41;
      translateY += matrix.m42;
    }

    return {
      left: rect.left - translateX + window.scrollX,
      top: rect.top - translateY + window.scrollY,
      width: rect.width,
      height: rect.height,
    };
  };

  // Every wait here is capped. The hero is lazy-loaded, and a lazy image that
  // is still off screen (arriving from the foot of a long page) may not start
  // loading at all, so an uncapped decode() could leave the clone waiting.
  const within = (promise, ms) => Promise.race([
    promise,
    new Promise((resolve) => window.setTimeout(resolve, ms)),
  ]);

  const waitForImage = (container) => {
    const image = container.querySelector("img");
    if (!image) return Promise.resolve();
    image.loading = "eager";

    const loaded = image.complete && image.naturalWidth > 0
      ? Promise.resolve()
      : Promise.race([
          new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          }),
          new Promise((resolve) => window.setTimeout(resolve, 800)),
        ]);

    return loaded.then(() => within(image.decode?.().catch(() => {}), 400));
  };

  const afterPaint = () => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });

  document.addEventListener(
    "click",
    (event) => {
      if (
        reducedMotion.matches ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = event.target.closest("a.project-transition");
      if (!anchor || anchor.target === "_blank") return;

      const source = anchor.closest(".project-card")?.querySelector(".project-card-img");
      const sourceRect = source?.getBoundingClientRect();
      if (!source || !sourceRect || sourceRect.width === 0 || sourceRect.height === 0) return;

      removeTransition();

      const clone = source.cloneNode(true);
      const sourceCard = source.closest(".project-card");
      const sourceImage = source.querySelector("img");
      const cloneImage = clone.querySelector("img");

      clone.classList.add("project-transition-clone");
      clone.setAttribute("aria-hidden", "true");
      // Positioning is set inline as well as in .project-transition-clone, so
      // the clone can never fall back into the page flow (appended after the
      // footer, under the sidebar) if that rule is ever missing.
      Object.assign(clone.style, {
        position: "fixed",
        zIndex: "5",
        margin: "0",
        pointerEvents: "none",
        left: `${sourceRect.left}px`,
        top: `${sourceRect.top}px`,
        width: `${sourceRect.width}px`,
        height: `${sourceRect.height}px`,
        borderRadius: getComputedStyle(sourceCard).borderRadius,
        boxShadow: getComputedStyle(sourceCard).boxShadow,
      });

      if (cloneImage && sourceImage) {
        cloneImage.removeAttribute("loading");
        cloneImage.style.transform = getComputedStyle(sourceImage).transform;
      }

      document.body.appendChild(clone);
      const hold = clone.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.012)" },
        ],
        { duration: 220, easing, fill: "forwards" },
      );

      activeTransition = { clone, cloneImage, hold, target: undefined, watchdog: 0 };
      armWatchdog(activeTransition, STALE_MS);
    },
    true,
  );

  pushState.addEventListener("hy-push-state-after", () => {
    if (!activeTransition) return;

    const transition = activeTransition;
    const target = document.querySelector("#project .project-hero");
    if (!target) {
      removeTransition();
      return;
    }

    target.classList.add("project-transition-target");
    transition.target = target;
    armWatchdog(transition, SETTLE_MS);
    const start = transition.clone.getBoundingClientRect();
    transition.hold.cancel();
    Object.assign(transition.clone.style, {
      left: `${start.left}px`,
      top: `${start.top}px`,
      width: `${start.width}px`,
      height: `${start.height}px`,
    });

    const end = finalRect(target);
    const targetStyle = getComputedStyle(target);
    const move = transition.clone.animate(
      [
        {
          transform: "translate3d(0, 0, 0) scale(1)",
          borderRadius: transition.clone.style.borderRadius,
          boxShadow: transition.clone.style.boxShadow,
        },
        {
          transform: `translate3d(${end.left - start.left}px, ${end.top - start.top}px, 0) scale(${end.width / start.width}, ${end.height / start.height})`,
          borderRadius: targetStyle.borderRadius,
          boxShadow: targetStyle.boxShadow,
        },
      ],
      { duration: 560, easing, fill: "forwards" },
    );

    if (transition.cloneImage) {
      transition.cloneImage.animate(
        [
          { transform: transition.cloneImage.style.transform || "none" },
          { transform: "none" },
        ],
        { duration: 560, easing, fill: "forwards" },
      );
    }

    Promise.all([move.finished, waitForImage(target)])
      .then(async () => {
        if (activeTransition !== transition) return;
        const targetImage = target.querySelector("img");
        if (targetImage) targetImage.style.opacity = "1";
        target.classList.remove("project-transition-target");
        await afterPaint();
        if (activeTransition === transition) removeTransition();
      })
      .catch(() => {
        if (activeTransition === transition) removeTransition();
      });
  });

  pushState.addEventListener("hy-push-state-error", fadeOutTransition);
  pushState.addEventListener("hy-push-state-networkerror", fadeOutTransition);
  window.addEventListener("pagehide", removeTransition);
})();