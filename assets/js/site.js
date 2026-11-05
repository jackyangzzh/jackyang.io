// jackyang.io — progressive enhancement. Every page works without this file;
// it stretches the type, runs the player bar, performs Fig. 1, and adds a few
// conveniences.
(() => {
  "use strict";

  const d = document;
  const root = d.documentElement;
  const $ = (s, el = d) => el.querySelector(s);
  const $$ = (s, el = d) => Array.from(el.querySelectorAll(s));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const store = {
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  // A polite live region for small confirmations ("Copied").
  const live = d.createElement("div");
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  d.body.append(live);
  const announce = (msg) => { live.textContent = ""; setTimeout(() => { live.textContent = msg; }, 60); };

  /* ------------------------------------------------------------ theme */

  const osDark = matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () => root.getAttribute("data-theme") || (osDark.matches ? "dark" : "light");
  const themeMeta = $('meta[name="theme-color"]');

  function syncThemeUI() {
    const t = currentTheme();
    $$("[data-theme-toggle]").forEach((b) => { b.textContent = t === "dark" ? "Light mode" : "Dark mode"; });
    if (themeMeta) themeMeta.content = themeMeta.dataset[t];
  }

  function applyTheme(next) {
    root.setAttribute("data-theme", next);
    store.set("theme", next);
    syncThemeUI();
  }

  function toggleTheme(origin) {
    const next = currentTheme() === "dark" ? "light" : "dark";
    if (!d.startViewTransition || reduced.matches) return applyTheme(next);
    const r = origin && origin.getBoundingClientRect ? origin.getBoundingClientRect() : null;
    const x = r ? r.left + r.width / 2 : innerWidth - 48;
    const y = r ? r.top + r.height / 2 : innerHeight - 30;
    const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.style.setProperty("--vt-x", `${x}px`);
    root.style.setProperty("--vt-y", `${y}px`);
    root.style.setProperty("--vt-r", `${rad}px`);
    root.classList.add("theme-vt");
    const t = d.startViewTransition(() => applyTheme(next));
    t.finished.finally(() => root.classList.remove("theme-vt"));
  }

  function theme() {
    syncThemeUI();
    osDark.addEventListener("change", syncThemeUI);
    $$("[data-theme-toggle]").forEach((b) => b.addEventListener("click", () => toggleTheme(b)));
  }

  /* ------------------------------------------------------------ edge to edge */

  // Each [data-fit] line is stretched to the full measure: measured at 100px,
  // then scaled. The last letter's negative tracking hangs past the box, so
  // that overhang is counted in. On the cover, if the stretched headline
  // would push the first screen past the bar, the whole stack shrinks and
  // centres instead.
  const OVERHANG = 3.5; // px at 100px: .035em of trailing tracking
  function fit() {
    const lines = $$("[data-fit]");
    if (!lines.length) return;
    const hero = $("[data-hero]");
    const stack = hero && $("[data-stack]", hero);
    const bar = $("[data-bar]");
    const size = () => {
      lines.forEach((el) => {
        const avail = el.clientWidth;
        if (!avail) return; // the wide/narrow headline set not shown at this width
        el.style.fontSize = "100px";
        const w = el.firstElementChild.getBoundingClientRect().width;
        const cap = parseFloat(getComputedStyle(el).getPropertyValue("--fit-cap")) || Infinity;
        if (w) el.style.fontSize = `${Math.min(cap, (100 * avail) / (w + OVERHANG)).toFixed(2)}px`;
      });
      if (!stack) return;
      stack.classList.remove("is-capped");
      const over = hero.offsetHeight - (innerHeight - (bar ? bar.offsetHeight : 0));
      const h = stack.offsetHeight;
      if (over > 1 && h) {
        const k = Math.max(0.5, (h - over) / h);
        $$("[data-fit]", stack).forEach((el) => { if (el.clientWidth) el.style.fontSize = `${(parseFloat(el.style.fontSize) * k).toFixed(2)}px`; });
        stack.classList.add("is-capped");
      }
    };
    size();
    if (d.fonts) d.fonts.ready.then(size);
    let w = innerWidth;
    let h = innerHeight;
    let t = 0;
    addEventListener("resize", () => {
      // Phone toolbars change the height while scrolling; only a real resize refits.
      if (innerWidth === w && Math.abs(innerHeight - h) < 120) return;
      w = innerWidth;
      h = innerHeight;
      cancelAnimationFrame(t);
      t = requestAnimationFrame(size);
    });
  }

  /* ------------------------------------------------------------ the player bar */

  // The rail shows how far through the page you are, with a mark at each
  // track (the home page's sections, or a case study's headings); the bar
  // names the track you're in. While Fig. 1 plays, the rail is Fig. 1's.
  function bar() {
    const el = $("[data-bar]");
    if (!el) return;
    const rail = $("[data-rail]", el);
    const track = $("[data-bar-track]", el);
    const label0 = track ? track.textContent : "";
    const navLinks = $$(".bar__nav a").filter((a) => new URL(a.href, location.href).pathname === location.pathname);
    let marks = $$("main [data-track]").map((m) => [m, m.dataset.track]);
    if (!marks.length) marks = $$("[data-prose] > h2[id]").map((h) => [h, h.textContent]);
    let tops = [];
    let shown = null;
    const fig = () => root.classList.contains("is-fig");
    const update = () => {
      if (fig()) return;
      const max = Math.max(1, root.scrollHeight - innerHeight);
      rail.style.setProperty("--p", Math.min(1, scrollY / max).toFixed(4));
      let cur = -1;
      tops.forEach((t, i) => { if (scrollY + innerHeight * 0.4 >= t) cur = i; });
      const text = cur < 0 ? label0 : marks[cur][1];
      if (text !== shown) {
        shown = text;
        if (track) track.textContent = text;
        // The bar's nav follows the section in view.
        const id = cur < 0 ? "" : marks[cur][0].id;
        const hit = navLinks.find((a) => a.hash && a.hash === `#${id}`);
        navLinks.forEach((a) => a.classList.toggle("is-here", a === hit));
      }
    };
    const measure = () => {
      tops = marks.map(([m]) => m.getBoundingClientRect().top + scrollY);
      update();
    };
    let ticking = false;
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); } }, { passive: true });
    d.addEventListener("bar:refresh", () => { shown = null; update(); });
    new ResizeObserver(measure).observe(d.body);
    measure();

    // Links back to this very page scroll to the top instead of reloading it.
    $$("a[href]").forEach((a) => {
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname !== location.pathname || u.hash || u.search) return;
      a.addEventListener("click", (e) => {
        if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        scrollTo({ top: 0, behavior: reduced.matches ? "auto" : "smooth" });
      });
    });
  }

  /* ------------------------------------------------------------ the index */

  function indexMenu() {
    const btn = $("[data-index-open]");
    const panel = $("[data-index]");
    if (!btn || !panel) return;
    const background = $$("main, footer, .skip");
    const isOpen = () => btn.getAttribute("aria-expanded") === "true";
    const set = (open) => {
      if (open === isOpen()) return;
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Close" : "Menu";
      root.classList.toggle("index-open", open);
      background.forEach((e) => { e.inert = open; });
      if (open) {
        panel.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => { if (isOpen()) panel.classList.add("is-open"); }));
        panel.tabIndex = -1;
        panel.focus({ preventScroll: true });
      } else {
        panel.classList.remove("is-open");
        if (panel.contains(d.activeElement)) btn.focus();
        setTimeout(() => { if (!isOpen()) panel.hidden = true; }, reduced.matches ? 0 : 420);
      }
    };
    btn.addEventListener("click", () => set(!isOpen()));
    panel.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    d.addEventListener("keydown", (e) => {
      if (!isOpen() || $("dialog[open]")) return;
      if (e.key === "Escape") { set(false); btn.focus(); return; }
      if (e.key !== "Tab") return;
      const controls = [...$$("a[href], button", panel), btn].filter((c) => c.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (d.activeElement === panel) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
      else if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ------------------------------------------------------------ Fig. 1, the film */

  // Play turns the headline into a screen: the film rises in a box in the
  // headline's place, inside the page, and the button becomes Close. The
  // bar's rail is its timeline (click to seek) and Esc closes it. The film
  // ends on a red square; the page takes over from there: the screen fades,
  // the headline rises again, and the square flies into its full stop.
  function fig1() {
    const hero = $("[data-hero]");
    const fig = hero && $("[data-fig]", hero);
    if (!fig) return;
    const btn = $("[data-fig-play]", fig);
    const film = $("[data-film]", hero);
    const v = $("[data-film-video]", film);
    const stage = $("[data-stage]", hero);
    const label = btn.innerHTML;
    const rail = $("[data-rail]");
    // The agent's turn in the film: 2.0 s to 2.5 s.
    const markAgent = (dur) => { if (rail) { rail.style.setProperty("--a0", `${(200 / dur).toFixed(2)}%`); rail.style.setProperty("--aw", `${(50 / dur).toFixed(2)}%`); } };
    markAgent(17.9);
    v.addEventListener("loadedmetadata", () => markAgent(v.duration));
    const narrow = matchMedia("(max-width: 39.999em)");
    let open = false;
    let raf = 0;

    const tick = () => {
      if (!open) return;
      if (rail && v.duration) rail.style.setProperty("--p", (v.currentTime / v.duration).toFixed(4));
      raf = requestAnimationFrame(tick);
    };
    // Wide screens: the largest 16:9 box that fits the headline's area,
    // centred in it. Phones: edge to edge at 16:10 (the crop only takes the
    // film's side margins), pushing the intro down if it needs the room.
    const place = () => {
      const gap = 24; // clear of the role line above
      stage.style.minHeight = "";
      const h = hero.getBoundingClientRect();
      let st = stage.getBoundingClientRect();
      if (narrow.matches) {
        const w = h.width, hh = (w * 10) / 16;
        if (hh + gap > st.height) { stage.style.minHeight = `${Math.ceil(hh + gap * 2)}px`; st = stage.getBoundingClientRect(); }
        Object.assign(film.style, { left: "0px", top: `${st.top - h.top + gap + (st.height - gap - hh) / 2}px`, width: `${w}px`, height: `${hh}px` });
        return;
      }
      const cs = getComputedStyle(stage);
      const pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight);
      const aw = st.width - pl - pr, ah = st.height - gap;
      const w = Math.min(aw, (ah * 16) / 9), hh = (w * 9) / 16;
      Object.assign(film.style, {
        left: `${st.left - h.left + pl + (aw - w) / 2}px`,
        top: `${st.top - h.top + gap + (ah - hh) / 2}px`,
        width: `${w}px`,
        height: `${hh}px`,
      });
    };

    // The headline's final full stop, wrapped once so the square can land in it.
    const stopOf = () => {
      const line = $$(".hero__line", hero).filter((l) => l.clientWidth).pop();
      if (!line) return null;
      let sp = $(".hero__stop", line);
      if (sp) return sp;
      const walk = d.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      let last = null;
      while (walk.nextNode()) if (walk.currentNode.nodeValue.trim()) last = walk.currentNode;
      const i = last ? last.nodeValue.lastIndexOf(".") : -1;
      if (i < 0) return null;
      const dotText = last.splitText(i);
      dotText.splitText(1);
      sp = d.createElement("span");
      sp.className = "hero__stop";
      dotText.replaceWith(sp);
      sp.append(dotText);
      return sp;
    };
    // Where the full stop's ink sits on screen, measured from the font.
    const inkOf = (sp) => {
      const cs = getComputedStyle(sp);
      const cx = d.createElement("canvas").getContext("2d");
      cx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      cx.fontStretch = "expanded"; // after .font, which resets it
      const m = cx.measureText(".");
      const r = sp.getBoundingClientRect();
      const base = r.bottom - m.fontBoundingBoxDescent;
      const x0 = r.left - m.actualBoundingBoxLeft, x1 = r.left + m.actualBoundingBoxRight;
      const y0 = base - m.actualBoundingBoxAscent, y1 = base + m.actualBoundingBoxDescent;
      return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, s: Math.max(x1 - x0, y1 - y0) };
    };
    new ResizeObserver(() => { if (open) place(); }).observe(hero);
    const show = () => {
      if (open) return;
      open = true;
      const source = $("source[data-src]", v);
      if (source) { source.src = source.dataset.src; delete source.dataset.src; v.load(); }
      place();
      film.hidden = false;
      hero.classList.add("is-film");
      root.classList.add("is-fig", "is-live");
      requestAnimationFrame(() => requestAnimationFrame(() => film.classList.add("is-open")));
      v.currentTime = 0;
      v.play().catch(() => {});
      btn.innerHTML = '<svg class="i" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="3" y="3" width="8" height="8" fill="currentColor"/></svg><span>Close</span>';
      btn.setAttribute("aria-label", "Close Fig. 1");
      raf = requestAnimationFrame(tick);
    };
    const hide = (landing) => {
      if (!open) return;
      open = false;
      stage.style.minHeight = "";
      cancelAnimationFrame(raf);
      v.pause();
      film.classList.remove("is-open");
      film.classList.add("is-closing");
      hero.classList.remove("is-film");
      root.classList.remove("is-fig", "is-live");
      d.dispatchEvent(new Event("bar:refresh"));
      setTimeout(() => { if (!open) { film.hidden = true; film.classList.remove("is-closing"); } }, reduced.matches ? 0 : 700);
      btn.innerHTML = label;
      btn.setAttribute("aria-label", btn.dataset.label);
      if (landing) {
        // The headline rises again, as it does on load.
        $$(".hero__line .fit__in", hero).forEach((el) => { el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; });
      }
    };

    // The end: the film's last frame is a red square at its centre. A square
    // on the page takes its place and flies into the headline's full stop,
    // which takes the red and settles to ink, as in the film.
    const land = () => {
      if (!open) return;
      const sp = stopOf();
      if (reduced.matches || !sp) { hide(); return; }
      const f = film.getBoundingClientRect();
      const k = Math.max(f.width / 1920, f.height / 1080);
      const s0 = 32 * k;
      // Measure the landing spot before the headline starts rising.
      stage.style.minHeight = "";
      const to = inkOf(sp);
      const sq = d.createElement("span");
      sq.className = "flystop";
      sq.setAttribute("aria-hidden", "true");
      Object.assign(sq.style, { left: `${f.left + f.width / 2 - s0 / 2}px`, top: `${f.top + f.height / 2 - s0 / 2}px`, width: `${s0}px`, height: `${s0}px` });
      d.body.append(sq);
      sp.classList.add("is-waiting");
      hide(true);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        sq.classList.add("is-flying");
        Object.assign(sq.style, { left: `${to.x - to.s / 2}px`, top: `${to.y - to.s / 2}px`, width: `${to.s}px`, height: `${to.s}px` });
      }));
      setTimeout(() => {
        sq.remove();
        sp.classList.remove("is-waiting");
        sp.classList.add("is-landed");
        setTimeout(() => sp.classList.remove("is-landed"), 80);
      }, 1150);
    };

    btn.dataset.label = btn.getAttribute("aria-label");
    btn.addEventListener("click", () => (open ? hide() : show()));
    addEventListener("scroll", () => { const sq = $(".flystop"); if (sq) sq.remove(); $$(".hero__stop").forEach((s) => s.classList.remove("is-waiting")); }, { passive: true });
    v.addEventListener("ended", land);
    v.addEventListener("click", () => (v.paused ? v.play() : v.pause()));
    d.addEventListener("keydown", (e) => { if (open && e.key === "Escape" && !$("dialog[open]")) hide(); });
    if (rail) rail.addEventListener("click", (e) => {
      if (!open || !v.duration) return;
      const r = rail.getBoundingClientRect();
      v.currentTime = Math.max(0, Math.min(0.999, (e.clientX - r.left) / r.width)) * v.duration;
      if (v.paused) v.play().catch(() => {});
    });
    // Scrolled away or tab hidden: it pauses; it doesn't resume by itself.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => { if (open && en.intersectionRatio < 0.4) v.pause(); }, { threshold: [0, 0.4] }).observe(hero);
    }
    d.addEventListener("visibilitychange", () => { if (d.hidden && open) v.pause(); });
  }

  /* ------------------------------------------------------------ motion */

  // The cover's three lines drift against each other with the pointer, a
  // few pixels each way, so the headline reads as planes at different depths.
  function drift() {
    const stack = $("[data-stack]");
    if (!stack || reduced.matches || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const lines = $$(".hero__line", stack);
    let raf = 0;
    addEventListener("pointermove", (e) => {
      if (scrollY > innerHeight) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / innerWidth - 0.5;
        const y = e.clientY / innerHeight - 0.5;
        lines.forEach((l, i) => {
          const k = (i % 2 ? -1 : 1) * (10 + i * 8);
          l.style.transform = `translate3d(${(x * k).toFixed(1)}px, ${(y * 6).toFixed(1)}px, 0)`;
        });
      });
    }, { passive: true });
  }

  // The career strip plays once it's on screen; a role hovered below lights its bar.
  function career() {
    const el = $(".career");
    if (!el) return;
    const scroller = $("[data-career]", el);
    if (scroller.scrollWidth > scroller.clientWidth + 4) scroller.scrollLeft = scroller.scrollWidth;
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((en) => {
        if (!en.some((x) => x.isIntersecting)) return;
        el.classList.add("is-in");
        io.disconnect();
      }, { threshold: 0.35 });
      io.observe(el);
    } else el.classList.add("is-in");
    $$(".row[id]").forEach((row) => {
      const bar = $(`.career__bar[href="#${row.id}"]`, el);
      if (!bar) return;
      row.addEventListener("pointerenter", () => bar.classList.add("is-lit"));
      row.addEventListener("pointerleave", () => bar.classList.remove("is-lit"));
    });
  }

  /* ------------------------------------------------------------ projects: filter */

  function filters() {
    const nav = $("[data-filters]");
    const list = $("[data-discs]");
    if (!nav || !list) return;
    nav.hidden = false;
    const btns = $$("[data-filter]", nav);
    const items = $$(":scope > li", list);
    const apply = (cat, push) => {
      btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === cat)));
      let k = 0;
      items.forEach((li) => {
        const on = cat === "all" || li.dataset.cat === cat;
        li.classList.toggle("is-hidden", !on);
        if (on && !reduced.matches) {
          li.style.animation = "none";
          void li.offsetWidth;
          li.style.animation = `rise .5s var(--ease) ${k++ * 45}ms both`;
        }
      });
      if (push) history.replaceState(null, "", cat === "all" ? location.pathname : `#${cat}`);
      d.dispatchEvent(new Event("bar:refresh"));
    };
    btns.forEach((b) => b.addEventListener("click", () => apply(b.dataset.filter, true)));
    const h = location.hash.slice(1);
    if (btns.some((b) => b.dataset.filter === h)) apply(h, false);
  }

  /* ------------------------------------------------------------ view transitions */

  // The art you click travels into the single's page. Only one element per
  // page may carry the name, so it moves to the clicked sleeve's image.
  function vtLinks() {
    if (!("onpagereveal" in window)) return;
    d.addEventListener("click", (e) => {
      const a = e.target.closest("[data-vt-link]");
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const img = $("img", a);
      if (!img) return;
      $$("img").forEach((el) => { if (el.style.viewTransitionName) el.style.viewTransitionName = ""; });
      img.style.viewTransitionName = "hero-media";
    });
    addEventListener("pageshow", (e) => {
      if (!e.persisted) return;
      $$("[data-vt-link] img").forEach((el) => { el.style.viewTransitionName = ""; });
      const hero = $(".single__img");
      if (hero) hero.style.viewTransitionName = "hero-media";
    });
  }

  /* ------------------------------------------------------------ outro: your turn */

  // The lamp lights once the outro is on screen.
  function turn() {
    const el = $("[data-turn]");
    if (!el || reduced.matches || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      el.classList.add("is-on");
      io.disconnect();
    }, { threshold: 1 });
    io.observe(el);
  }

  /* ------------------------------------------------------------ media */

  function videos() {
    d.addEventListener("click", (e) => {
      const a = e.target.closest("[data-video-id]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      const frame = d.createElement("div");
      frame.className = "video__frame";
      const start = a.dataset.videoStart ? `&start=${encodeURIComponent(a.dataset.videoStart)}` : "";
      frame.innerHTML =
        `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(a.dataset.videoId)}?autoplay=1&rel=0&playsinline=1${start}" ` +
        `title="${esc(a.dataset.videoTitle)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
        `allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
      a.replaceWith(frame);
      $("iframe", frame).focus();
    });

    // Short demo clips play while on screen (muted loops), never with reduced motion.
    // With this script, a quiet Play/Pause replaces the native control bar; a
    // clip the visitor paused stays paused when it scrolls back into view.
    const vids = $$("video[data-deferred-video]");
    if (!vids.length) return;
    vids.forEach((v) => {
      const box = d.createElement("div");
      const btn = d.createElement("button");
      box.className = "loop";
      btn.type = "button";
      btn.className = "loop__btn mono";
      const sync = () => {
        const on = !v.paused;
        btn.textContent = on ? "Pause" : "Play";
        btn.setAttribute("aria-label", on ? "Pause clip" : "Play clip");
        box.classList.toggle("is-paused", !on);
      };
      btn.addEventListener("click", () => {
        if (v.paused) { delete v.dataset.held; v.play().catch(sync); }
        else { v.dataset.held = ""; v.pause(); }
      });
      v.addEventListener("click", () => btn.click());
      v.addEventListener("play", sync);
      v.addEventListener("pause", sync);
      v.removeAttribute("controls");
      v.before(box);
      box.append(v, btn);
      sync();
    });
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      const v = en.target;
      if (en.isIntersecting) {
        if (v.preload === "none") v.preload = "auto";
        if (v.dataset.autoplay === "true" && !reduced.matches && !("held" in v.dataset)) v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    }), { rootMargin: "120px 0px" });
    vids.forEach((v) => io.observe(v));
  }

  /* ------------------------------------------------------------ 404: one turn */

  // Words a path or title shares with others are noise: section names, ids, years.
  const STOP = new Set(["blog", "blogs", "projects", "project", "posts", "post", "html", "index", "the", "and", "for", "my"]);
  const words = (s) => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w) && !/^\d+$/.test(w) && !/^[0-9a-f]{8,}$/.test(w));
  // The page whose words cover most of the requested path's words (prefixes
  // count, so "fake-haul" finds "FakeHaul"); at least half must match.
  const closest = (path, pages) => {
    const want = words(path);
    let best = null, top = 0;
    for (const pg of want.length ? pages : []) {
      const have = words(`${pg.k} ${pg.t}`);
      const hit = want.filter((w) => have.some((h) => h.startsWith(w) || (h.length > 2 && w.startsWith(h)))).length / want.length;
      if (hit > top) { top = hit; best = pg; }
    }
    return top >= 0.5 ? best : null;
  };

  function lost() {
    const el = $("[data-lost]");
    if (!el || /\/404(\.html)?$/.test(location.pathname)) return;
    let path = location.pathname, pages = [];
    try { path = decodeURIComponent(path); } catch { /* keep it encoded */ }
    try { pages = JSON.parse($("[data-lost-pages]").textContent); } catch { /* no suggestions */ }
    $("[data-lost-path]", el).textContent = path;
    const hit = closest(path, pages);
    if (hit) $("[data-lost-said] p", el).insertAdjacentHTML("afterend", `<p>You were probably after <a href="${esc(hit.u)}">${esc(hit.t.replace(/[.!?]+$/, ""))}</a>.</p>`);
    $("[data-lost-ask]", el).hidden = false;
    if (reduced.matches) return;
    // Jack waits for a real pause before taking the turn, as in Fig. 1.
    const pause = $("[data-lost-pause]", el), reply = $("[data-lost-reply]", el);
    pause.hidden = false;
    reply.classList.add("is-waiting");
    requestAnimationFrame(() => requestAnimationFrame(() => pause.classList.add("is-on")));
    setTimeout(() => reply.classList.remove("is-waiting"), 1100);
  }

  /* ------------------------------------------------------------ copy email */

  async function copyText(value, msg) {
    try { await navigator.clipboard.writeText(value); announce(msg || "Copied"); return true; }
    catch { return false; }
  }

  function copy() {
    if (!navigator.clipboard) return;
    $$("[data-copy-fallback]").forEach((el) => { el.hidden = true; });
    $$("[data-copy]").forEach((b) => {
      b.hidden = false;
      let timer = 0;
      b.addEventListener("click", async () => {
        if (!(await copyText(b.dataset.copy, "Email address copied"))) return;
        b.classList.add("is-done");
        clearTimeout(timer);
        timer = setTimeout(() => b.classList.remove("is-done"), 1600);
      });
    });
  }

  /* ------------------------------------------------------------ ⌘K */

  function cmdk() {
    const dataEl = $("#cmdk-data");
    if (!dataEl) return;
    let data;
    try { data = JSON.parse(dataEl.textContent); } catch { return; }

    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    if (!isMac) $$("[data-mod]").forEach((k) => { k.textContent = "Ctrl "; });
    const openers = $$("[data-cmdk-open]");
    openers.forEach((o) => { o.hidden = false; o.addEventListener("click", () => open()); });

    const search = '<svg class="i" width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12.5 12.5l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

    // Contact leads: it's what most visitors open the menu to find.
    const commands = [
      { group: "Contact", label: "Book a 30-minute call", keys: "calendly meeting schedule", url: data.schedule, ext: true },
      { group: "Contact", label: "Send an email", keys: "contact mail", meta: data.email, url: `mailto:${data.email}` },
      { group: "Contact", label: "Copy email address", keys: "contact mail", run: () => copyText(data.email, "Email address copied") },
      { group: "Contact", label: "Open résumé (PDF)", keys: "resume cv download", url: data.resume },
      ...data.pages.map((p) => ({ group: "Pages", label: p.label, url: p.url })),
      ...data.projects.map((p) => ({ group: "Projects", label: p.label, url: p.url, meta: p.meta })),
      ...data.posts.map((p) => ({ group: "Writing", label: p.label, url: p.url, meta: p.meta, ext: true })),
      { group: "Actions", label: "Toggle dark mode", keys: "theme light", run: () => toggleTheme() },
      ...data.profiles.map((p) => ({ group: "Elsewhere", label: p.label, url: p.url, ext: true })),
    ].map((c) => ({ ...c, hay: `${c.label} ${c.group} ${c.meta || ""} ${c.keys || ""}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") }));

    let dlg;
    let input;
    let list;
    let shown = [];
    let active = 0;

    const build = () => {
      dlg = d.createElement("dialog");
      dlg.className = "cmdk";
      dlg.setAttribute("aria-label", "Command menu");
      dlg.innerHTML =
        `<div class="cmdk__field">${search}<input class="cmdk__input" type="text" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" placeholder="Search pages, projects, writing…" autocomplete="off" spellcheck="false" aria-label="Search the site"><kbd class="cmdk__esc">Esc</kbd></div>` +
        '<ul class="cmdk__list" id="cmdk-list" role="listbox" aria-label="Results"></ul>' +
        '<div class="cmdk__foot"><span><kbd>↑↓</kbd> Move</span><span><kbd>↵</kbd> Open</span><span><kbd>Esc</kbd> Close</span></div>';
      d.body.append(dlg);
      input = $(".cmdk__input", dlg);
      list = $(".cmdk__list", dlg);
      input.addEventListener("input", render);
      input.addEventListener("keydown", onKey);
      list.addEventListener("click", (e) => { const li = e.target.closest('[role="option"]'); if (li) run(shown[Number(li.dataset.i)], e); });
      list.addEventListener("pointermove", (e) => { const li = e.target.closest('[role="option"]'); if (li) setActive(Number(li.dataset.i), false); });
      dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    };

    const mark = (label, q) => {
      if (!q) return esc(label);
      const i = label.toLowerCase().indexOf(q);
      return i < 0 ? esc(label) : `${esc(label.slice(0, i))}<mark>${esc(label.slice(i, i + q.length))}</mark>${esc(label.slice(i + q.length))}`;
    };

    function render() {
      const q = input.value.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      const words = q.split(/\s+/).filter(Boolean);
      shown = commands.filter((c) => words.every((w) => c.hay.includes(w)));
      if (q) shown.sort((a, b) => (b.label.toLowerCase().startsWith(q) - a.label.toLowerCase().startsWith(q)));
      if (!shown.length) {
        list.innerHTML = `<li class="cmdk__empty" role="presentation">Nothing matches “${esc(input.value)}”.</li>`;
        input.removeAttribute("aria-activedescendant");
        return;
      }
      let html = "";
      let group = "";
      shown.forEach((c, i) => {
        if (!q && c.group !== group) { group = c.group; html += `<li class="cmdk__group" role="presentation">${esc(group)}</li>`; }
        html += `<li class="cmdk__item" role="option" id="cmdk-${i}" data-i="${i}" aria-selected="false"><span>${mark(c.label, words[0])}</span>${c.meta ? `<span class="cmdk__meta">${esc(c.meta)}</span>` : ""}</li>`;
      });
      list.innerHTML = html;
      setActive(0, true);
    }

    function setActive(i, scroll) {
      if (!shown.length) return;
      active = (i + shown.length) % shown.length;
      $$('[role="option"]', list).forEach((li) => li.setAttribute("aria-selected", String(Number(li.dataset.i) === active)));
      input.setAttribute("aria-activedescendant", `cmdk-${active}`);
      if (scroll !== false) { const el = $(`#cmdk-${active}`, list); if (el) el.scrollIntoView({ block: "nearest" }); }
    }

    function onKey(e) {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
      else if (e.key === "Home" && shown.length) { e.preventDefault(); setActive(0); }
      else if (e.key === "End" && shown.length) { e.preventDefault(); setActive(shown.length - 1); }
      else if (e.key === "Enter" && shown[active]) { e.preventDefault(); run(shown[active], e); }
    }

    function run(c, e) {
      if (!c) return;
      if (c.run) { dlg.close(); setTimeout(() => c.run(), 80); return; }
      const newTab = c.ext || (e && (e.metaKey || e.ctrlKey));
      dlg.close();
      if (newTab && !c.url.startsWith("mailto:")) window.open(c.url, "_blank", "noopener");
      else location.href = c.url;
    }

    function open() {
      if (!dlg) build();
      if (dlg.open) return;
      input.value = "";
      render();
      dlg.showModal();
      input.focus();
    }

    d.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dlg && dlg.open) dlg.close(); else open();
      }
    });
  }

  /* ------------------------------------------------------------ go */

  // These only wire up listeners, so they run right away.
  theme();
  indexMenu();
  vtLinks();
  videos();
  copy();
  cmdk();
  filters();

  // These measure the page, so they wait until it has been laid out once.
  requestAnimationFrame(() => setTimeout(() => {
    fit();
    bar();
    career();
    drift();
    fig1();
    turn();
    lost();
  }, 0));
})();
