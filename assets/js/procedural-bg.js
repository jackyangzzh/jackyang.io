(function () {
  "use strict";

  var canvas = document.getElementById("procedural-bg");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reducedMotion = motionQuery.matches;
  var drawer = document.getElementById("_drawer");
  var isCover = !!(drawer && drawer.classList.contains("cover"));
  var connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  var lowPower = !!(
    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (connection && connection.saveData)
  );

  var frameRate = lowPower ? 20 : 30;
  var frameInterval = 1000 / frameRate;
  var welcomeDuration = lowPower ? 2200 : 2700;
  var welcomeStorageKey = "jackyang-ambient-welcome-seen-v1";

  var w = 0;
  var h = 0;
  var dpr = 1;
  var time = 1200;
  var particles = [];
  var animId = null;
  var resizeTimer = null;
  var lastFrameTime = 0;
  var isVisible = true;
  var pageVisible = !document.hidden;
  var initialized = false;
  var welcomeActive = false;
  var welcomeStart = 0;
  var currentWelcomeProgress = -1;
  var pauseStarted = 0;
  var pointerTargetX = 0;
  var pointerTargetY = 0;
  var pointerX = 0;
  var pointerY = 0;

  // Each colour blob is one radial gradient baked into a small sprite, then
  // blitted per frame at its own drifting position. Baking is what keeps the
  // frame short — drawing these gradients live is what once put 20 long tasks
  // on the main thread and cost ~2.2s of TBT. Blitting them separately (rather
  // than baking the whole field into one layer) is what lets the colours move
  // past each other instead of sliding around as a rigid picture.
  var SPRITE_SIZE = 256;

  var BG = { r: 18, g: 15, b: 38 };
  // Every hue sits in the theme's purple family (accent is rgb(170,130,230)),
  // spread just widely enough that the drift reads as colour change. Mixing
  // broad washes with a few tighter pools is what keeps the field from
  // flattening into one even tone.
  var blobs = [
    {
      color: [170, 130, 230],
      alpha: 0.3,
      radius: 0.55,
      xAmp: 0.36,
      yAmp: 0.3,
      xSpd: 0.00072,
      ySpd: 0.00049,
      xPh: 0,
      yPh: 1.4,
      depth: 1,
    },
    {
      color: [214, 150, 240],
      alpha: 0.24,
      radius: 0.36,
      xAmp: 0.42,
      yAmp: 0.35,
      xSpd: 0.00056,
      ySpd: 0.0008,
      xPh: 2.1,
      yPh: 0.3,
      depth: 0.7,
    },
    {
      color: [116, 108, 222],
      alpha: 0.3,
      radius: 0.6,
      xAmp: 0.32,
      yAmp: 0.38,
      xSpd: 0.00087,
      ySpd: 0.00042,
      xPh: 4.2,
      yPh: 2.8,
      depth: 1.3,
    },
    {
      color: [196, 122, 206],
      alpha: 0.2,
      radius: 0.32,
      xAmp: 0.46,
      yAmp: 0.26,
      xSpd: 0.00045,
      ySpd: 0.00094,
      xPh: 1.1,
      yPh: 4.5,
      depth: 0.5,
    },
    {
      color: [140, 152, 244],
      alpha: 0.22,
      radius: 0.42,
      xAmp: 0.28,
      yAmp: 0.42,
      xSpd: 0.00101,
      ySpd: 0.00063,
      xPh: 3.3,
      yPh: 5.6,
      depth: 1.6,
    },
    {
      color: [226, 176, 240],
      alpha: 0.14,
      radius: 0.28,
      xAmp: 0.4,
      yAmp: 0.32,
      xSpd: 0.00038,
      ySpd: 0.00108,
      xPh: 5.4,
      yPh: 3.1,
      depth: 0.35,
    },
  ];

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function easeOutCubic(value) {
    var v = clamp(value, 0, 1);
    return 1 - Math.pow(1 - v, 3);
  }

  function easeInOutCubic(value) {
    var v = clamp(value, 0, 1);
    return v < 0.5
      ? 4 * v * v * v
      : 1 - Math.pow(-2 * v + 2, 3) / 2;
  }

  function isFirstCoverVisit() {
    if (!isCover) return false;
    try {
      return window.localStorage.getItem(welcomeStorageKey) !== "1";
    } catch (error) {
      return true;
    }
  }

  function rememberWelcome() {
    try {
      window.localStorage.setItem(welcomeStorageKey, "1");
    } catch (error) {
      // Storage can be unavailable in privacy modes; the effect remains optional.
    }
  }

  function resize() {
    var parent = canvas.parentElement;
    if (!parent) return;

    var oldW = w;
    var oldH = h;
    var dprCap = lowPower ? 1.5 : 2;
    dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    w = parent.offsetWidth || window.innerWidth;
    h = parent.offsetHeight || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (oldW && oldH) {
      for (var i = 0; i < particles.length; i++) {
        particles[i].x *= w / oldW;
        particles[i].y *= h / oldH;
      }
    }

    initParticles();
    buildBlobs();
    if (initialized) render(false, currentWelcomeProgress);
  }

  function initParticles() {
    var area = w * h;
    var minCount = lowPower ? 18 : 26;
    var maxCount = lowPower ? 36 : isCover ? 82 : 44;
    var count = clamp(Math.floor(area / 13000), minCount, maxCount);

    while (particles.length > count) particles.pop();
    while (particles.length < count) {
      var depth = 0.4 + Math.random() * 0.6;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.26 * depth,
        vy: ((Math.random() - 0.5) * 0.18 - 0.025) * depth,
        size: (0.7 + Math.random() * 1.15) * (0.75 + depth * 0.3),
        depth: depth,
        baseAlpha: 0.16 + Math.random() * 0.34,
        twinkleSpd: 0.011 + Math.random() * 0.019,
        twinklePh: Math.random() * Math.PI * 2,
        sparkle: Math.random() < (isCover ? 0.18 : 0.08),
      });
    }
  }

  function updateParallax() {
    pointerX += (pointerTargetX - pointerX) * 0.085;
    pointerY += (pointerTargetY - pointerY) * 0.085;
  }

  function sweepAt(x, progress) {
    if (progress < 0 || progress > 1) return 0;
    var center = (-0.18 + easeInOutCubic(progress) * 1.36) * w;
    var band = Math.max(70, w * 0.16);
    var distance = (x - center) / band;
    return Math.exp(-distance * distance * 2.2);
  }

  // One sprite per blob, baked once at init. Size is fixed and small; every
  // blob is drawn scaled up from it, and the upscale doubles as the blur.
  function buildBlobs() {
    for (var i = 0; i < blobs.length; i++) {
      var blob = blobs[i];
      if (blob.sprite) continue;

      var sprite = document.createElement("canvas");
      sprite.width = SPRITE_SIZE;
      sprite.height = SPRITE_SIZE;
      var c = sprite.getContext("2d");
      var mid = SPRITE_SIZE / 2;

      var gradient = c.createRadialGradient(mid, mid, 0, mid, mid, mid);
      gradient.addColorStop(0, rgba(blob.color, 1));
      gradient.addColorStop(0.42, rgba(blob.color, 0.34));
      gradient.addColorStop(1, rgba(blob.color, 0));
      c.fillStyle = gradient;
      c.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

      blob.sprite = sprite;
    }
  }

  function rgba(color, alpha) {
    return (
      "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + alpha + ")"
    );
  }

  function drawColorField(fieldAlpha) {
    ctx.fillStyle = "rgb(" + BG.r + "," + BG.g + "," + BG.b + ")";
    ctx.fillRect(0, 0, w, h);

    // `screen` clamps instead of blowing out to white where blobs pile up,
    // which plain alpha and `lighter` both fail to do at these counts.
    ctx.globalCompositeOperation = "screen";
    var reach = Math.max(w, h);
    var colorTime = time * (isCover ? 1.65 : 1);

    for (var i = 0; i < blobs.length; i++) {
      var blob = blobs[i];
      var radius =
        reach *
        blob.radius *
        (1 + 0.05 * Math.sin(colorTime * 0.0018 + i * 1.5));
      var cx =
        w * (0.5 + blob.xAmp * Math.sin(colorTime * blob.xSpd + blob.xPh)) +
        pointerX * blob.depth * 18;
      var cy =
        h * (0.5 + blob.yAmp * Math.cos(colorTime * blob.ySpd + blob.yPh)) +
        pointerY * blob.depth * 14;
      var glow = 0.92 + 0.08 * Math.sin(colorTime * 0.0026 + i * 1.2);

      ctx.globalAlpha = blob.alpha * fieldAlpha * glow;
      ctx.drawImage(
        blob.sprite,
        cx - radius,
        cy - radius,
        radius * 2,
        radius * 2,
      );
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function drawParticles(advance, ambientAlpha, welcomeProgress) {
    var i;
    var particle;
    var alpha;
    var twinkle;
    var blink;
    var sweep;

    if (advance) {
      for (i = 0; i < particles.length; i++) {
        particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20) particle.x += w + 40;
        else if (particle.x > w + 20) particle.x -= w + 40;
        if (particle.y < -20) particle.y += h + 40;
        else if (particle.y > h + 20) particle.y -= h + 40;
      }
    }

    for (i = 0; i < particles.length; i++) {
      particle = particles[i];
      blink =
        0.5 +
        0.5 * Math.sin(time * particle.twinkleSpd + particle.twinklePh);
      twinkle = particle.sparkle
        ? 0.28 + 0.72 * Math.pow(blink, 5)
        : 0.48 + 0.52 * blink;
      sweep = sweepAt(particle.x, welcomeProgress);
      alpha = clamp(
        particle.baseAlpha *
          twinkle *
          ambientAlpha *
          (1 + sweep * 0.58),
        0,
        0.88,
      );

      var px = particle.x + pointerX * particle.depth * 4;
      var py = particle.y + pointerY * particle.depth * 3;
      var nodeRadius = particle.size + sweep * 0.22;

      // Soft halo behind each node. Cheaper than canvas shadowBlur, and it is
      // what makes the nodes read as lit points rather than flat dots.
      ctx.beginPath();
      ctx.arc(px, py, nodeRadius * 3.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(235,220,230," + alpha * 0.16 + ")";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(250,240,235," + alpha + ")";
      ctx.fill();

      // A few stars flare into crisp four-point glints. The high power on the
      // sine wave keeps each blink brief and gives the field an irregular,
      // firefly-like rhythm instead of making every point pulse together.
      if (particle.sparkle) {
        var flare = Math.pow(blink, 9);
        if (flare > 0.025) {
          var flareRadius = nodeRadius * (2.2 + flare * 4.2);
          ctx.beginPath();
          ctx.moveTo(px - flareRadius, py);
          ctx.lineTo(px + flareRadius, py);
          ctx.moveTo(px, py - flareRadius);
          ctx.lineTo(px, py + flareRadius);
          ctx.lineWidth = 0.45 + flare * 0.55;
          ctx.strokeStyle =
            "rgba(255,246,238," +
            clamp(alpha * flare * 1.55, 0, 0.9) +
            ")";
          ctx.stroke();
        }
      }
    }
  }

  function render(advance, welcomeProgress) {
    var ambientAlpha =
      welcomeProgress >= 0
        ? 0.58 + easeOutCubic(welcomeProgress) * 0.42
        : 1;

    if (advance) updateParallax();

    drawColorField(ambientAlpha);
    drawParticles(advance, ambientAlpha, welcomeProgress);
  }

  function requestNextFrame() {
    if (
      !initialized ||
      animId ||
      reducedMotion ||
      !isVisible ||
      !pageVisible
    ) {
      return;
    }
    animId = requestAnimationFrame(frame);
  }

  function frame(now) {
    animId = null;
    if (reducedMotion || !isVisible || !pageVisible) return;

    if (!lastFrameTime) lastFrameTime = now - frameInterval;
    var elapsed = now - lastFrameTime;

    if (elapsed < frameInterval) {
      animId = requestAnimationFrame(frame);
      return;
    }

    lastFrameTime = now - (elapsed % frameInterval);
    time += Math.min(elapsed, 100) / (1000 / 60);

    var welcomeProgress = -1;
    if (welcomeActive) {
      welcomeProgress = clamp(
        (now - welcomeStart) / welcomeDuration,
        0,
        1,
      );
      currentWelcomeProgress = welcomeProgress;
      if (welcomeProgress >= 1) {
        welcomeActive = false;
        currentWelcomeProgress = -1;
      }
    }

    render(true, welcomeProgress);

    // Keep going. Frames are cheap now that the orb and wave layers are baked,
    // so the network can drift continuously instead of freezing until the
    // visitor happens to interact. Visibility and reduced-motion checks at the
    // top of this function still park the loop when it isn't wanted.
    animId = requestAnimationFrame(frame);
  }

  // The loop no longer stops on its own, so this just makes sure it is running
  // (for example after the tab was backgrounded).
  function wakeForInteraction() {
    if (!initialized || reducedMotion) return;
    requestNextFrame();
  }

  function updatePointer(event) {
    pointerTargetX = clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1);
    pointerTargetY = clamp((event.clientY / window.innerHeight) * 2 - 1, -1, 1);
    wakeForInteraction();
  }

  function resetPointer() {
    pointerTargetX = 0;
    pointerTargetY = 0;
    wakeForInteraction();
  }

  function setupInteraction() {
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerleave", resetPointer, { passive: true });

    var events = ["pointerdown", "wheel", "scroll", "keydown", "touchstart"];
    function onInteraction() {
      wakeForInteraction();
    }

    for (var i = 0; i < events.length; i++) {
      window.addEventListener(events[i], onInteraction, { passive: true });
    }
  }

  function startWelcome() {
    if (
      !initialized ||
      reducedMotion ||
      !pageVisible ||
      !isVisible ||
      !isFirstCoverVisit()
    ) {
      return;
    }

    rememberWelcome();
    welcomeActive = true;
    currentWelcomeProgress = 0;
    welcomeStart = performance.now();
    render(false, 0);
    requestNextFrame();
  }

  function init() {
    if (initialized) return;
    resize();
    initialized = true;
    setupInteraction();

    if (reducedMotion) {
      render(false, -1);
      return;
    }

    startWelcome();
    if (!welcomeActive) render(false, -1);
    // Start the ambient loop. Previously this waited for the first pointer or
    // scroll event, which meant most visitors only ever saw a frozen frame.
    requestNextFrame();
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          isVisible = entries[i].isIntersecting;
        }

        if (isVisible) {
          startWelcome();
          requestNextFrame();
        } else if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      },
      { threshold: 0 },
    );
    observer.observe(canvas);
  }

  document.addEventListener("visibilitychange", function () {
    pageVisible = !document.hidden;

    if (!pageVisible) {
      pauseStarted = performance.now();
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      return;
    }

    if (welcomeActive && pauseStarted) {
      welcomeStart += performance.now() - pauseStarted;
    }
    pauseStarted = 0;
    startWelcome();
    requestNextFrame();
  });

  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  function onMotionChange(event) {
    reducedMotion = event.matches;

    if (reducedMotion) {
      if (animId) cancelAnimationFrame(animId);
      animId = null;
      welcomeActive = false;
      currentWelcomeProgress = -1;
      render(false, -1);
      return;
    }

    startWelcome();
  }

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", onMotionChange);
  } else if (motionQuery.addListener) {
    motionQuery.addListener(onMotionChange);
  }

  if ("requestIdleCallback" in window) {
    requestIdleCallback(init, { timeout: 800 });
  } else {
    requestAnimationFrame(function () {
      requestAnimationFrame(init);
    });
  }
})();
