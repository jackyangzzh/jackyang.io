(() => {
  const pushState = document.getElementById("_pushState");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
  let activeTransition;

  if (!pushState || typeof Element.prototype.animate !== "function") return;

  const removeTransition = () => {
    if (!activeTransition) return;
    activeTransition.target?.classList.remove("project-transition-target");
    activeTransition.clone.remove();
    activeTransition = undefined;
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

  const waitForImage = (container) => {
    const image = container.querySelector("img");
    if (!image) return Promise.resolve();

    const loaded = image.complete && image.naturalWidth > 0
      ? Promise.resolve()
      : Promise.race([
          new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          }),
          new Promise((resolve) => window.setTimeout(resolve, 800)),
        ]);

    return loaded.then(() => image.decode?.().catch(() => {}));
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
      Object.assign(clone.style, {
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

      activeTransition = { clone, cloneImage, hold, target: undefined };
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

  window.addEventListener("pagehide", removeTransition);
})();