(function () {
  'use strict';

  var canvas = document.getElementById('procedural-bg');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var w, h, dpr;
  var time = 0;
  var particles = [];
  var animId = null;
  var isVisible = true;

  // Color palette — dark navy base with teal/blue/purple accents
  var BG = { r: 18, g: 42, b: 56 };

  var orbs = [
    { r: 79,  g: 177, b: 186, a: 0.15, radius: 0.55, xSpd: 0.00028, ySpd: 0.00019, xPh: 0.0, yPh: 0.0, xAmp: 0.38, yAmp: 0.30 },
    { r: 50,  g: 120, b: 170, a: 0.12, radius: 0.45, xSpd: 0.00020, ySpd: 0.00028, xPh: 2.1, yPh: 1.0, xAmp: 0.32, yAmp: 0.35 },
    { r: 90,  g: 65,  b: 140, a: 0.09, radius: 0.40, xSpd: 0.00024, ySpd: 0.00016, xPh: 4.2, yPh: 2.8, xAmp: 0.28, yAmp: 0.38 },
    { r: 45,  g: 165, b: 185, a: 0.10, radius: 0.38, xSpd: 0.00032, ySpd: 0.00022, xPh: 1.1, yPh: 4.5, xAmp: 0.42, yAmp: 0.25 },
    { r: 65,  g: 100, b: 155, a: 0.08, radius: 0.50, xSpd: 0.00015, ySpd: 0.00025, xPh: 3.3, yPh: 1.7, xAmp: 0.35, yAmp: 0.32 },
  ];

  function resize() {
    var parent = canvas.parentElement;
    if (!parent) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = parent.offsetWidth || window.innerWidth;
    h = parent.offsetHeight || window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles() {
    var area = w * h;
    var count = Math.max(25, Math.min(90, Math.floor(area / 12000)));

    while (particles.length > count) particles.pop();
    while (particles.length < count) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.25 - 0.05,
        size: 0.8 + Math.random() * 1.5,
        baseAlpha: 0.2 + Math.random() * 0.5,
        twinkleSpd: 0.012 + Math.random() * 0.025,
        twinklePh: Math.random() * Math.PI * 2,
      });
    }
  }

  function drawOrbs() {
    ctx.globalCompositeOperation = 'screen';

    for (var i = 0; i < orbs.length; i++) {
      var o = orbs[i];
      var cx = w * (0.5 + o.xAmp * Math.sin(time * o.xSpd + o.xPh));
      var cy = h * (0.5 + o.yAmp * Math.cos(time * o.ySpd + o.yPh));
      var r = Math.max(w, h) * o.radius;

      // Subtle breathing
      r *= 1 + 0.06 * Math.sin(time * 0.001 + i * 1.5);

      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, 'rgba(' + o.r + ',' + o.g + ',' + o.b + ',' + o.a + ')');
      grad.addColorStop(0.4, 'rgba(' + o.r + ',' + o.g + ',' + o.b + ',' + (o.a * 0.35) + ')');
      grad.addColorStop(1, 'rgba(' + o.r + ',' + o.g + ',' + o.b + ',0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  function drawParticles() {
    var maxDist = Math.min(140, Math.max(w, h) * 0.1);
    var maxDistSq = maxDist * maxDist;
    var i, j, p, dx, dy, distSq, alpha, twinkle;

    // Update positions
    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x += w + 40;
      else if (p.x > w + 20) p.x -= w + 40;
      if (p.y < -20) p.y += h + 40;
      else if (p.y > h + 20) p.y -= h + 40;
    }

    // Draw connections
    ctx.lineWidth = 0.5;
    for (i = 0; i < particles.length; i++) {
      for (j = i + 1; j < particles.length; j++) {
        dx = particles[i].x - particles[j].x;
        dy = particles[i].y - particles[j].y;
        distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          alpha = (1 - distSq / maxDistSq) * 0.15;
          ctx.strokeStyle = 'rgba(79,177,186,' + alpha + ')';
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      twinkle = 0.5 + 0.5 * Math.sin(time * p.twinkleSpd + p.twinklePh);
      alpha = p.baseAlpha * twinkle;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(210,235,245,' + alpha + ')';
      ctx.fill();
    }
  }

  // Draw subtle flowing wave lines for an aurora feel
  function drawWaves() {
    ctx.globalCompositeOperation = 'screen';

    var configs = [
      { baseY: 0.3, amp: 0.08, freq: 0.003, speed: 0.0004, color: '79,177,186', alpha: 0.04 },
      { baseY: 0.5, amp: 0.11, freq: 0.0025, speed: 0.00055, color: '60,130,170', alpha: 0.03 },
      { baseY: 0.7, amp: 0.14, freq: 0.002, speed: 0.0007, color: '85,70,140', alpha: 0.025 },
    ];

    for (var n = 0; n < configs.length; n++) {
      var c = configs[n];
      var by = h * c.baseY;
      var amp = h * c.amp;

      ctx.beginPath();
      ctx.moveTo(0, by);
      for (var x = 0; x <= w; x += 4) {
        var y = by
          + amp * Math.sin(x * c.freq + time * c.speed + n * 2)
          + amp * 0.5 * Math.sin(x * c.freq * 1.8 + time * c.speed * 0.7 + n);
        ctx.lineTo(x, y);
      }

      // Soft glow pass (wide, lower opacity)
      ctx.strokeStyle = 'rgba(' + c.color + ',' + (c.alpha * 0.5) + ')';
      ctx.lineWidth = 6 + n * 3;
      ctx.stroke();

      // Core line pass (thin, full opacity)
      ctx.strokeStyle = 'rgba(' + c.color + ',' + c.alpha + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  function frame() {
    if (!isVisible) {
      animId = null;
      return;
    }

    time++;

    // Clear
    ctx.fillStyle = 'rgb(' + BG.r + ',' + BG.g + ',' + BG.b + ')';
    ctx.fillRect(0, 0, w, h);

    drawOrbs();
    drawWaves();
    drawParticles();

    if (!reducedMotion) {
      animId = requestAnimationFrame(frame);
    }
  }

  // Pause when not visible for performance
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      isVisible = entry.isIntersecting;
      if (isVisible && !animId && !reducedMotion) {
        animId = requestAnimationFrame(frame);
      }
    });
  }, { threshold: 0 });
  observer.observe(canvas);

  // Debounced resize
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  // Init
  resize();

  if (reducedMotion) {
    time = 1200;
    frame();
  } else {
    animId = requestAnimationFrame(frame);
  }
})();
