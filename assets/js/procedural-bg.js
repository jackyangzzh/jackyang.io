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
  var interactionUntil = 0;
  var pauseStarted = 0;
  var pointerTargetX = 0;
  var pointerTargetY = 0;
  var pointerX = 0;
  var pointerY = 0;

  // Deep indigo with warm rose, peach, lavender, and soft mint accents.
  var BG = { r: 32, g: 28, b: 58 };
  var orbs = [
    {
      r: 235,
      g: 145,
      b: 160,
      a: 0.13,
      radius: 0.55,
      xSpd: 0.00028,
      ySpd: 0.00019,
      xPh: 0,
      yPh: 0,
      xAmp: 0.38,
      yAmp: 0.3,
    },
    {
      r: 245,
      g: 180,
      b: 135,
      a: 0.1,
      radius: 0.45,
      xSpd: 0.0002,
      ySpd: 0.00028,
      xPh: 2.1,
      yPh: 1,
      xAmp: 0.32,
      yAmp: 0.35,
    },
    {
      r: 160,
      g: 130,
      b: 215,
      a: 0.1,
      radius: 0.4,
      xSpd: 0.00024,
      ySpd: 0.00016,
      xPh: 4.2,
      yPh: 2.8,
      xAmp: 0.28,
      yAmp: 0.38,
    },
    {
      r: 120,
      g: 200,
      b: 190,
      a: 0.09,
      radius: 0.38,
      xSpd: 0.00032,
      ySpd: 0.00022,
      xPh: 1.1,
      yPh: 4.5,
      xAmp: 0.42,
      yAmp: 0.25,
    },
    {
      r: 220,
      g: 150,
      b: 200,
      a: 0.07,
      radius: 0.5,
      xSpd: 0.00015,
      ySpd: 0.00025,
      xPh: 3.3,
      yPh: 1.7,
      xAmp: 0.35,
      yAmp: 0.32,
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
    if (initialized) render(false, currentWelcomeProgress);
  }

  function initParticles() {
    var area = w * h;
    var minCount = lowPower ? 18 : 24;
    var maxCount = lowPower ? 36 : isCover ? 58 : 44;
    var count = clamp(Math.floor(area / 16500), minCount, maxCount);

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

  function drawOrbs(ambientAlpha) {
    ctx.globalCompositeOperation = "screen";

    for (var i = 0; i < orbs.length; i++) {
      var orb = orbs[i];
      var offset = 4 + i * 1.4;
      var cx =
        w * (0.5 + orb.xAmp * Math.sin(time * orb.xSpd + orb.xPh)) +
        pointerX * offset;
      var cy =
        h * (0.5 + orb.yAmp * Math.cos(time * orb.ySpd + orb.yPh)) +
        pointerY * offset * 0.7;
      var radius = Math.max(w, h) * orb.radius;
      var alpha = orb.a * ambientAlpha;

      radius *= 1 + 0.045 * Math.sin(time * 0.001 + i * 1.5);

      var gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(
        0,
        "rgba(" + orb.r + "," + orb.g + "," + orb.b + "," + alpha + ")",
      );
      gradient.addColorStop(
        0.42,
        "rgba(" +
          orb.r +
          "," +
          orb.g +
          "," +
          orb.b +
          "," +
          alpha * 0.34 +
          ")",
      );
      gradient.addColorStop(
        1,
        "rgba(" + orb.r + "," + orb.g + "," + orb.b + ",0)",
      );
      ctx.fillStyle = gradient;
      ctx.fillRect(-16, -16, w + 32, h + 32);
    }

    ctx.globalCompositeOperation = "source-over";
  }

  function drawParticles(advance, ambientAlpha, welcomeProgress) {
    var maxDist = Math.min(132, Math.max(w, h) * 0.1);
    var maxDistSq = maxDist * maxDist;
    var i;
    var j;
    var particle;
    var dx;
    var dy;
    var distSq;
    var alpha;
    var twinkle;
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

    ctx.lineWidth = 0.5;
    for (i = 0; i < particles.length; i++) {
      for (j = i + 1; j < particles.length; j++) {
        dx = particles[i].x - particles[j].x;
        dy = particles[i].y - particles[j].y;
        distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          sweep = sweepAt(
            (particles[i].x + particles[j].x) * 0.5,
            welcomeProgress,
          );
          alpha =
            (1 - distSq / maxDistSq) *
            0.105 *
            ambientAlpha *
            (1 + sweep * 0.32);
          ctx.strokeStyle = "rgba(235,220,230," + alpha + ")";
          ctx.beginPath();
          ctx.moveTo(
            particles[i].x + pointerX * particles[i].depth * 4,
            particles[i].y + pointerY * particles[i].depth * 3,
          );
          ctx.lineTo(
            particles[j].x + pointerX * particles[j].depth * 4,
            particles[j].y + pointerY * particles[j].depth * 3,
          );
          ctx.stroke();
        }
      }
    }

    for (i = 0; i < particles.length; i++) {
      particle = particles[i];
      twinkle =
        0.55 +
        0.45 * Math.sin(time * particle.twinkleSpd + particle.twinklePh);
      sweep = sweepAt(particle.x, welcomeProgress);
      alpha = clamp(
        particle.baseAlpha *
          twinkle *
          ambientAlpha *
          (1 + sweep * 0.58),
        0,
        0.72,
      );

      ctx.beginPath();
      ctx.arc(
        particle.x + pointerX * particle.depth * 4,
        particle.y + pointerY * particle.depth * 3,
        particle.size + sweep * 0.22,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = "rgba(250,240,235," + alpha + ")";
      ctx.fill();
    }
  }

  function drawWaves(ambientAlpha) {
    ctx.globalCompositeOperation = "screen";

    var configs = [
      {
        baseY: 0.3,
        amp: 0.08,
        freq: 0.003,
        speed: 0.0004,
        color: "235,160,175",
        alpha: 0.036,
      },
      {
        baseY: 0.5,
        amp: 0.11,
        freq: 0.0025,
        speed: 0.00055,
        color: "245,190,145",
        alpha: 0.028,
      },
      {
        baseY: 0.7,
        amp: 0.14,
        freq: 0.002,
        speed: 0.0007,
        color: "165,135,215",
        alpha: 0.03,
      },
    ];

    for (var n = 0; n < configs.length; n++) {
      var config = configs[n];
      var baseY = h * config.baseY + pointerY * (2 + n);
      var amplitude = h * config.amp;
      var alpha = config.alpha * ambientAlpha;

      ctx.beginPath();
      ctx.moveTo(-8, baseY);
      for (var x = -8; x <= w + 8; x += 4) {
        var y =
          baseY +
          amplitude *
            Math.sin(x * config.freq + time * config.speed + n * 2) +
          amplitude *
            0.5 *
            Math.sin(
              x * config.freq * 1.8 + time * config.speed * 0.7 + n,
            );
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = "rgba(" + config.color + "," + alpha * 0.46 + ")";
      ctx.lineWidth = 6 + n * 3;
      ctx.stroke();

      ctx.strokeStyle = "rgba(" + config.color + "," + alpha + ")";
      ctx.lineWidth = 1.25;
      ctx.stroke();
    }

    ctx.globalCompositeOperation = "source-over";
  }

  function render(advance, welcomeProgress) {
    var ambientAlpha =
      welcomeProgress >= 0
        ? 0.58 + easeOutCubic(welcomeProgress) * 0.42
        : 1;

    ctx.fillStyle = "rgb(" + BG.r + "," + BG.g + "," + BG.b + ")";
    ctx.fillRect(0, 0, w, h);

    if (advance) updateParallax();
    drawOrbs(ambientAlpha);
    drawWaves(ambientAlpha);
    drawParticles(advance, ambientAlpha, welcomeProgress);
  }

  function pointerIsSettled() {
    return (
      Math.abs(pointerTargetX - pointerX) < 0.008 &&
      Math.abs(pointerTargetY - pointerY) < 0.008
    );
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

    if (
      welcomeActive ||
      now < interactionUntil ||
      !pointerIsSettled()
    ) {
      animId = requestAnimationFrame(frame);
    } else {
      lastFrameTime = 0;
    }
  }

  function wakeForInteraction(duration) {
    if (!initialized || reducedMotion) return;
    interactionUntil = Math.max(
      interactionUntil,
      performance.now() + (duration || 1200),
    );
    requestNextFrame();
  }

  function updatePointer(event) {
    pointerTargetX = clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1);
    pointerTargetY = clamp((event.clientY / window.innerHeight) * 2 - 1, -1, 1);
    wakeForInteraction(1000);
  }

  function resetPointer() {
    pointerTargetX = 0;
    pointerTargetY = 0;
    wakeForInteraction(1200);
  }

  function setupInteraction() {
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerleave", resetPointer, { passive: true });

    var events = ["pointerdown", "wheel", "scroll", "keydown", "touchstart"];
    function onInteraction() {
      wakeForInteraction(1400);
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
