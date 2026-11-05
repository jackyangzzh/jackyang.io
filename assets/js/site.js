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

  /* ------------------------------------------------------------ Fig. 1, performed */

  // The illustrated conversation, performed as lyrics on the cover: each line
  // lights word by word as it's said; a gap draws a horizon that fills toward
  // the turn threshold and turns red past it. When the agent takes its turn,
  // red bursts from the middle and floods the cover. It plays only when the
  // visitor presses Play.
  function fig1() {
    const hero = $("[data-hero]");
    const fig = hero && $("[data-fig]", hero);
    if (!fig) return;
    const btn = $("[data-fig-play]", fig);
    const lyric = $("[data-lyric]", hero);
    const who = $("[data-lyric-who]", hero);
    const line = $("[data-lyric-line]", hero);
    const meter = $("[data-lyric-meter]", hero);
    const rail = $("[data-rail]");
    const track = $("[data-bar-track]");
    const TURN = 1.2; // illustrative: how long a gap must last before the agent may speak
    let turns;
    try { turns = JSON.parse($("[data-fig-data]", fig).textContent); } catch { return; }
    if (!Array.isArray(turns) || !turns.length) return;

    let t = 0;
    const segs = turns.map((x) => {
      const gap = x.pause != null;
      const dur = Number(gap ? x.pause : x.dur) || 1;
      const s = { who: x.who, text: String(x.text || ""), gap, agent: !gap && x.who === "agent", start: t, end: t + dur };
      t += dur;
      return s;
    });
    const total = t;
    const segAt = (tt) => segs.find((s) => tt >= s.start && tt < s.end) || segs[segs.length - 1];
    const agent = segs.find((s) => s.agent);
    if (rail && agent) {
      rail.style.setProperty("--a0", `${((agent.start / total) * 100).toFixed(2)}%`);
      rail.style.setProperty("--aw", `${(((agent.end - agent.start) / total) * 100).toFixed(2)}%`);
    }
    const stamp = (s) => {
      const m = Math.floor(s / 60);
      return `${String(m).padStart(2, "0")}:${(s - m * 60).toFixed(1).padStart(4, "0")}`;
    };

    let cur = null;
    let words = [];
    let said = -1;
    const show = (tt) => {
      const seg = segAt(Math.min(tt, total - 0.001));
      const into = tt - seg.start;
      if (seg !== cur) {
        cur = seg;
        said = -1;
        lyric.classList.toggle("is-gap", seg.gap);
        lyric.classList.toggle("is-agent", seg.agent);
        lyric.classList.remove("is-over");
        if (seg.gap) {
          who.textContent = "";
          line.textContent = seg.text || "Pause";
          words = [];
        } else {
          who.textContent = seg.agent ? "Agent" : seg.who;
          line.innerHTML = seg.text.split(" ").map((w) => `<span>${esc(w)}</span>`).join(" ");
          words = $$("span", line);
        }
        hero.classList.toggle("is-flood", seg.agent);
      }
      if (seg.gap) {
        meter.style.setProperty("--m", Math.min(1, into / TURN).toFixed(3));
        lyric.classList.toggle("is-over", into >= TURN);
      } else {
        const n = Math.min(words.length, Math.ceil((words.length * into) / ((seg.end - seg.start) * 0.9)));
        if (n !== said) { said = n; words.forEach((w, i) => w.classList.toggle("is-said", i < n)); }
      }
      if (rail) rail.style.setProperty("--p", (tt / total).toFixed(4));
      if (track) track.textContent = `Fig. 1, ${stamp(tt)} of ${stamp(total)}`;
    };

    const ICON = {
      pause: '<svg class="i" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 2v8M8.5 2v8" stroke="currentColor" stroke-width="2"/></svg>',
      play: '<svg class="i" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" fill="currentColor"/></svg>',
      replay: '<svg class="i" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 6a3.8 3.8 0 1 0 1.1-2.7M2.2 1.6v2.2h2.2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    };
    let playing = false;
    let ended = false;
    let held = false;
    let inView = true;
    let pt = 0;
    let last = 0;
    let raf = 0;
    let doneTimer = 0;
    const setBtn = () => {
      const [k, label] = playing ? ["pause", "Pause"] : ended ? ["replay", "Replay"] : ["play", pt > 0 ? "Resume" : "Play"];
      btn.innerHTML = `${ICON[k]}<span>${label}</span>`;
      btn.setAttribute("aria-label", `${label} Fig. 1, the illustrated conversation`);
    };
    const onStage = (on) => {
      hero.classList.toggle("is-playing", on);
      root.classList.toggle("is-fig", on && inView);
      if (!on) { hero.classList.remove("is-flood"); cur = null; }
      if (!root.classList.contains("is-fig")) d.dispatchEvent(new Event("bar:refresh"));
    };
    const frame = (now) => {
      if (!playing) return;
      pt += Math.min(0.1, (now - last) / 1000);
      last = now;
      if (pt >= total) return finish();
      show(pt);
      raf = requestAnimationFrame(frame);
    };
    const play = () => {
      clearTimeout(doneTimer);
      if (ended) { pt = 0; ended = false; cur = null; }
      playing = true;
      held = false;
      onStage(true);
      root.classList.add("is-live");
      last = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
      setBtn();
    };
    const stop = () => {
      if (!playing) return;
      playing = false;
      cancelAnimationFrame(raf);
      root.classList.remove("is-live");
      setBtn();
    };
    const finish = () => {
      stop();
      ended = true;
      setBtn();
      // Rest on the last line a moment, then the cover returns.
      doneTimer = setTimeout(() => { if (!playing) onStage(false); }, 1800);
    };
    const leave = () => { stop(); clearTimeout(doneTimer); pt = 0; ended = false; onStage(false); setBtn(); };

    btn.hidden = false;
    setBtn();
    btn.addEventListener("click", () => { if (playing) stop(); else play(); });
    d.addEventListener("keydown", (e) => { if (e.key === "Escape" && hero.classList.contains("is-playing") && !$("dialog[open]") && !root.classList.contains("index-open")) leave(); });
    // Clicking the rail while Fig. 1 is on the cover seeks it.
    if (rail) rail.addEventListener("click", (e) => {
      if (!root.classList.contains("is-fig")) return;
      const r = rail.getBoundingClientRect();
      pt = Math.max(0, Math.min(0.999, (e.clientX - r.left) / r.width)) * total;
      ended = false;
      show(pt);
      setBtn();
    });

    // Off screen or in a hidden tab it holds, and picks up again on return.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => {
        inView = en.intersectionRatio >= 0.5;
        if (inView) {
          if (hero.classList.contains("is-playing")) root.classList.add("is-fig");
          if (held) play();
        } else {
          if (playing) { stop(); held = true; }
          root.classList.remove("is-fig");
          d.dispatchEvent(new Event("bar:refresh"));
        }
      }, { threshold: [0, 0.5] }).observe(hero);
    }
    d.addEventListener("visibilitychange", () => {
      if (d.hidden && playing) { stop(); held = true; }
      else if (!d.hidden && held && inView) play();
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

  /* ------------------------------------------------------- cover film */

  // The cover film plays muted and loops, but it is longer than five
  // seconds, so it gets a pause control. Attach its source only near the
  // viewport or on Play; reduced-motion visitors always start it manually.
  // The first play opens at data-start, past the film's near-black opening
  // second; later loops still run from 0, so the seam stays invisible.
  function cover() {
    const fig = $("[data-cover]");
    if (!fig) return;
    const v = $("[data-cover-video]", fig);
    const btn = $("[data-cover-toggle]", fig);
    if (!v) return;
    let held = false;

    const sync = () => {
      const playing = !v.paused && !v.ended;
      fig.classList.toggle("is-playing", playing);
      if (!btn) return;
      btn.textContent = playing ? "Pause" : "Play";
      btn.setAttribute("aria-label", playing ? "Pause the cover film" : "Play the cover film");
      btn.setAttribute("aria-pressed", playing ? "true" : "false");
    };
    const play = () => {
      const source = $("source[data-src]", v);
      if (source) {
        source.src = source.dataset.src;
        delete source.dataset.src;
        const start = +v.dataset.start || 0;
        if (start) v.addEventListener("loadedmetadata", () => { if (v.currentTime < start) v.currentTime = start; }, { once: true });
        v.load();
      }
      v.play().catch(sync);
    };

    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);

    if (btn) {
      btn.addEventListener("click", () => {
        if (v.paused) { held = false; play(); }
        else { held = true; v.pause(); }
        sync();
      });
    }

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { if (!held && !reduced.matches) play(); }
        else if (!v.paused) v.pause();
      }), { rootMargin: "120px 0px" });
      io.observe(v);
    }
    sync();
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
  cover();
  filters();

  // These measure the page, so they wait until it has been laid out once.
  requestAnimationFrame(() => setTimeout(() => {
    fit();
    bar();
    const career = $("[data-career]");
    if (career && career.scrollWidth > career.clientWidth + 4) career.scrollLeft = career.scrollWidth;
    fig1();
    turn();
    lost();
  }, 0));
})();
