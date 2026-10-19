// jackyang.io — progressive enhancement. Every page works without this file;
// it adds motion, the interactive figures and a few conveniences.
(() => {
  "use strict";

  const d = document;
  const root = d.documentElement;
  const $ = (s, el = d) => el.querySelector(s);
  const $$ = (s, el = d) => Array.from(el.querySelectorAll(s));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* private mode */ } },
  };

  // A polite live region for small confirmations ("Copied").
  const live = d.createElement("div");
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  d.body.append(live);
  const announce = (msg) => { live.textContent = ""; setTimeout(() => { live.textContent = msg; }, 60); };

  /* ------------------------------------------------------------ theme */

  const sysDark = matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () => root.getAttribute("data-theme") || (sysDark.matches ? "dark" : "light");
  const themeMetas = $$('meta[name="theme-color"]');
  const themeColors = { light: themeMetas[0]?.content, dark: themeMetas[1]?.content };

  function syncThemeUI() {
    const t = currentTheme();
    $$("[data-theme-toggle]").forEach((b) => b.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme"));
    // An explicit choice should colour the browser UI too, whatever the OS says.
    const forced = root.getAttribute("data-theme");
    themeMetas.forEach((m, i) => { m.content = forced ? themeColors[forced] : (i === 0 ? themeColors.light : themeColors.dark); });
  }

  function applyTheme(next) {
    // Choosing the OS theme again clears the override, so OS changes are followed.
    if (next === (sysDark.matches ? "dark" : "light")) { root.removeAttribute("data-theme"); store.del("theme"); }
    else { root.setAttribute("data-theme", next); store.set("theme", next); }
    syncThemeUI();
  }

  function toggleTheme(origin) {
    const next = currentTheme() === "dark" ? "light" : "dark";
    if (!d.startViewTransition || reduced.matches) return applyTheme(next);
    const r = origin && origin.getBoundingClientRect ? origin.getBoundingClientRect() : null;
    const x = r ? r.left + r.width / 2 : innerWidth - 48;
    const y = r ? r.top + r.height / 2 : 32;
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
    sysDark.addEventListener("change", syncThemeUI);
    $$("[data-theme-toggle]").forEach((b) => b.addEventListener("click", () => toggleTheme(b)));
  }

  /* ------------------------------------------------------------ clock */

  function clock() {
    const els = $$("[data-clock]");
    if (!els.length) return;
    let fmt;
    try { fmt = new Intl.DateTimeFormat("en-US", { timeZone: els[0].dataset.tz, hour: "numeric", minute: "2-digit" }); }
    catch { return; }
    const tick = () => {
      const s = fmt.format(new Date());
      els.forEach((el) => { const t = $("[data-clock-time]", el); if (t) t.textContent = s; el.hidden = false; });
    };
    tick();
    setTimeout(() => { tick(); setInterval(tick, 60000); }, (60 - new Date().getSeconds()) * 1000 + 50);
  }

  /* ------------------------------------------------------------ header + menu */

  function header() {
    const hd = $("[data-hd]");
    if (!hd) return;
    const on = () => hd.classList.toggle("is-scrolled", scrollY > 4);
    on();
    addEventListener("scroll", on, { passive: true });
  }

  function menu() {
    const btn = $("[data-menu-toggle]");
    const panel = $("[data-menu]");
    if (!btn || !panel) return;
    const isOpen = () => btn.getAttribute("aria-expanded") === "true";
    const set = (open) => {
      btn.setAttribute("aria-expanded", String(open));
      root.classList.toggle("menu-open", open);
      if (open) {
        panel.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add("is-open")));
      } else {
        panel.classList.remove("is-open");
        setTimeout(() => { if (!isOpen()) panel.hidden = true; }, 320);
      }
    };
    btn.addEventListener("click", () => set(!isOpen()));
    panel.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    d.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen()) { set(false); btn.focus(); } });
    matchMedia("(min-width: 56em)").addEventListener("change", (e) => { if (e.matches && isOpen()) set(false); });
  }

  /* ------------------------------------------------------------ travelling line */

  // One 2px line under the current option that glides to whatever is hovered
  // or focused: the leading edge moves first, the trailing edge 140ms later.
  function tracks() {
    $$("[data-track]").forEach((track) => {
      const line = d.createElement("span");
      line.className = "track__line";
      line.setAttribute("aria-hidden", "true");
      track.append(line);
      track.classList.add("has-line");

      const opts = () => $$(":scope > li > a, :scope > li > button", track);
      const current = () =>
        opts().find((a) => a.classList.contains("is-here")) ||
        opts().find((a) => a.matches('[aria-current="page"], [aria-pressed="true"]'));
      let shown = null;
      let pointerIn = false;

      const place = (el, instant) => {
        if (!el || !el.offsetWidth) { line.classList.remove("is-on"); shown = null; return; }
        const tr = track.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        const prev = shown && shown.isConnected ? shown.getBoundingClientRect() : null;
        const dir = prev ? Math.sign(r.left - prev.left) : 0;
        line.style.setProperty("--lag-l", dir > 0 ? ".14s" : "0s");
        line.style.setProperty("--lag-r", dir < 0 ? ".14s" : "0s");
        const jump = instant || !shown;
        if (jump) line.classList.add("is-instant");
        line.style.left = `${r.left - tr.left}px`;
        line.style.right = `${tr.right - r.right}px`;
        if (jump) { void line.offsetWidth; line.classList.remove("is-instant"); }
        line.classList.add("is-on");
        shown = el;
      };
      const rest = () => place(current());

      track.addEventListener("pointerover", (e) => {
        pointerIn = true;
        const a = e.target.closest("a, button");
        if (a && track.contains(a)) place(a);
      });
      track.addEventListener("pointerleave", () => { pointerIn = false; rest(); });
      track.addEventListener("focusin", (e) => place(e.target.closest("a, button")));
      track.addEventListener("focusout", () => setTimeout(() => { if (!track.contains(d.activeElement)) rest(); }, 0));
      track.addEventListener("track:update", () => { if (!pointerIn && !track.contains(d.activeElement)) rest(); });
      new ResizeObserver(() => place(current(), true)).observe(track);
      if (d.fonts) d.fonts.ready.then(() => place(current(), true));
    });
  }

  /* ------------------------------------------------------------ section links */

  // A nav item like "/#experience" is "here" while its section is in view, so
  // on the home page the travelling line follows you from About to Experience.
  function sectionSpy() {
    const pairs = $$("[data-track] a[href*='#']")
      .map((a) => {
        const u = new URL(a.href, location.href);
        const sec = u.pathname === location.pathname && u.hash && d.getElementById(u.hash.slice(1));
        return sec ? [a, sec] : null;
      })
      .filter(Boolean);
    if (!pairs.length) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = innerHeight * 0.35;
      pairs.forEach(([a, sec]) => {
        const r = sec.getBoundingClientRect();
        const here = r.top <= y && r.bottom > y;
        if (here !== a.classList.contains("is-here")) {
          a.classList.toggle("is-here", here);
          a.closest("[data-track]").dispatchEvent(new Event("track:update"));
        }
      });
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------ Fig. 1: the conversation */

  // An illustrated conversation drawn as a voice waveform. Scrubbing moves a
  // playhead; the caption shows who is speaking at that moment.
  function signal() {
    const fig = $("[data-signal]");
    if (!fig) return;
    const stage = $("[data-signal-stage]", fig);
    const head = $("[data-signal-head]", fig);
    const time = $("[data-signal-time]", fig);
    const text = $("[data-signal-text]", fig);
    let turns;
    try { turns = JSON.parse($("[data-signal-data]", fig).textContent); } catch { return; }
    if (!Array.isArray(turns) || !turns.length) return;

    let t = 0;
    const segs = turns.map((x) => {
      const gap = x.pause != null;
      const dur = Number(gap ? x.pause : x.dur) || 1;
      const s = { who: x.who, text: x.text, gap, start: t, end: t + dur };
      t += dur;
      return s;
    });
    const total = t;
    const segAt = (tt) => segs.find((s) => tt >= s.start && tt < s.end) || segs[segs.length - 1];

    const NS = "http://www.w3.org/2000/svg";
    const svg = d.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    stage.prepend(svg);

    let W = 0;
    let H = 0;
    let clipA;
    let clipB;

    const build = () => {
      const r = stage.getBoundingClientRect();
      W = Math.round(r.width);
      H = Math.round(r.height);
      if (!W || !H) return;
      const pitch = W < 560 ? 4.5 : 6;
      const bw = W < 560 ? 2.25 : 3;
      const n = Math.floor(W / pitch);
      let seed = 20261018;
      const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
      let bars = "";
      for (let i = 0; i < n; i++) {
        const tt = ((i + 0.5) / n) * total;
        const seg = segAt(tt);
        let amp = 0;
        if (!seg.gap) {
          const edge = Math.max(0, Math.min(1, (tt - seg.start) / 0.3, (seg.end - tt) / 0.3));
          const syllable = 0.5 + 0.5 * Math.abs(Math.sin(tt * 4.6 + seg.start * 3));
          const phrase = 0.72 + 0.28 * Math.sin(tt * 1.3 + seg.start);
          amp = edge * syllable * phrase * (0.42 + 0.58 * rnd());
          if (seg.who === "agent") amp *= 0.92;
        }
        const h = Math.max(2, amp * H);
        const x = i * pitch + (pitch - bw) / 2;
        const cls = seg.gap ? "h g" : seg.who === "agent" ? "a" : "h";
        bars += `<rect class="${cls}" x="${x.toFixed(2)}" y="${((H - h) / 2).toFixed(2)}" width="${bw}" height="${h.toFixed(2)}" rx="${bw / 2}"/>`;
      }
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.innerHTML =
        `<defs><clipPath id="sig-a"><rect x="0" y="-4" width="${W}" height="${H + 8}"/></clipPath>` +
        `<clipPath id="sig-b"><rect x="${W}" y="-4" width="0" height="${H + 8}"/></clipPath></defs>` +
        `<g clip-path="url(#sig-a)">${bars}</g><g class="w-rest" clip-path="url(#sig-b)">${bars}</g>`;
      clipA = svg.querySelector("#sig-a rect");
      clipB = svg.querySelector("#sig-b rect");
    };

    const stamp = (s) => {
      const m = Math.floor(s / 60);
      const sec = (s - m * 60).toFixed(1).padStart(4, "0");
      return `${String(m).padStart(2, "0")}:${sec}`;
    };

    const paint = (el, seg) => {
      if (!seg) {
        el.className = "signal__text";
        el.textContent = text.dataset.default;
      } else if (seg.gap) {
        el.className = "signal__text is-gap";
        el.textContent = seg.text || "Pause";
      } else {
        const agent = seg.who === "agent";
        el.className = `signal__text${agent ? " is-agent" : ""}`;
        el.innerHTML = `<b>${esc(agent ? "Agent" : seg.who)}</b>“${esc(seg.text)}”`;
      }
    };
    let cur = null;
    const caption = (seg) => {
      if (seg === cur) return;
      cur = seg;
      paint(text, seg);
    };
    // Reserve the height of the longest line at this width, so scrubbing
    // never moves the page below the figure.
    const fitCaption = () => {
      const probe = d.createElement("span");
      probe.setAttribute("aria-hidden", "true");
      probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:${text.getBoundingClientRect().width}px`;
      text.parentNode.append(probe);
      let max = 0;
      [null, ...segs].forEach((seg) => { paint(probe, seg); max = Math.max(max, probe.getBoundingClientRect().height); });
      probe.remove();
      text.style.minHeight = `${Math.ceil(max)}px`;
    };

    const show = (x) => {
      if (!clipA) return;
      x = Math.max(0, Math.min(W, x));
      clipA.setAttribute("width", x);
      clipB.setAttribute("x", x);
      clipB.setAttribute("width", W - x);
      head.style.setProperty("--x", `${x}px`);
      const tt = (x / W) * total;
      time.textContent = stamp(tt);
      time.style.transform = x < 32 ? "translate(0, -6px)" : x > W - 32 ? "translate(-100%, -6px)" : "";
      caption(segAt(Math.min(tt, total - 0.001)));
    };
    const reset = () => {
      fig.classList.remove("is-scrub");
      if (clipA) { clipA.setAttribute("width", W); clipB.setAttribute("x", W); clipB.setAttribute("width", 0); }
      caption(null);
    };

    let raf = 0;
    let releaseTimer = 0;
    const move = (e) => {
      const x = e.clientX - stage.getBoundingClientRect().left;
      fig.classList.add("is-scrub");
      clearTimeout(releaseTimer);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => show(x));
    };
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") { try { stage.setPointerCapture(e.pointerId); } catch { /* ignore */ } }
      move(e);
    });
    stage.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") reset(); });
    const release = (e) => { if (e.pointerType !== "mouse") { clearTimeout(releaseTimer); releaseTimer = setTimeout(reset, 1800); } };
    stage.addEventListener("pointerup", release);
    stage.addEventListener("pointercancel", release);

    build();
    reset();
    fitCaption();
    if (d.fonts) d.fonts.ready.then(fitCaption);
    let rt = 0;
    new ResizeObserver(() => { cancelAnimationFrame(rt); rt = requestAnimationFrame(() => { build(); reset(); fitCaption(); }); }).observe(stage);
  }

  /* ------------------------------------------------------------ career timeline */

  function timeline() {
    const tl = $("[data-tl]");
    if (!tl) return;
    const tip = $("[data-tl-tip]", tl);
    const scroller = $("[data-tl-scroll]", tl);
    const bars = $$(".tl__bar", tl);

    const fit = () => bars.forEach((b) => {
      const lab = $(".tl__label", b);
      b.classList.toggle("is-tight", lab.offsetWidth + 16 > b.clientWidth);
    });
    fit();
    new ResizeObserver(fit).observe(tl);
    if (d.fonts) d.fonts.ready.then(fit);

    // On narrow screens the chart scrolls; start at "now".
    requestAnimationFrame(() => { if (scroller.scrollWidth > scroller.clientWidth + 4) scroller.scrollLeft = scroller.scrollWidth; });

    const light = (id, on) => { const en = id && d.getElementById(id); if (en) en.classList.toggle("is-lit", on); };
    const showTip = (b) => {
      tip.innerHTML = `<b>${esc(b.dataset.tipTitle)}</b><span>${esc(b.dataset.tipSub)}</span><span>${esc(b.dataset.tipDates)}</span>`;
      tip.hidden = false;
      const tr = tl.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const w = tip.offsetWidth;
      const x = Math.max(w / 2, Math.min(tr.width - w / 2, br.left + br.width / 2 - tr.left));
      tip.style.left = `${x}px`;
      tip.style.top = `${br.top - tr.top}px`;
    };
    const hideTip = () => { tip.hidden = true; };

    bars.forEach((b) => {
      b.addEventListener("pointerenter", () => { showTip(b); light(b.dataset.target, true); });
      b.addEventListener("pointerleave", () => { hideTip(); light(b.dataset.target, false); });
      b.addEventListener("focus", () => showTip(b));
      b.addEventListener("blur", hideTip);
      b.addEventListener("click", () => {
        hideTip();
        const id = b.dataset.target;
        light(id, true);
        setTimeout(() => light(id, false), 1800);
      });
    });

    // Hovering an entry lights its bar.
    $$("[data-entry]").forEach((en) => {
      const bar = bars.find((b) => b.dataset.target === en.id);
      if (!bar) return;
      en.addEventListener("pointerenter", () => bar.classList.add("is-active"));
      en.addEventListener("pointerleave", () => bar.classList.remove("is-active"));
    });
  }

  /* ------------------------------------------------------------ projects index */

  function projectsIndex() {
    const list = $("[data-plist]");
    if (!list) return;
    const slides = $$("[data-slide]");
    const descs = $$("[data-desc]");
    const no = $("[data-viewer-no]");
    let active = null;

    const activate = (a) => {
      if (!a || a === active) return;
      if (active) active.classList.remove("is-active");
      a.classList.add("is-active");
      active = a;
      const i = Number(a.dataset.preview);
      slides.forEach((s) => s.classList.toggle("is-on", Number(s.dataset.slide) === i));
      descs.forEach((s) => s.classList.toggle("is-on", Number(s.dataset.desc) === i));
      if (no) no.textContent = String(i + 1).padStart(2, "0");
    };
    list.addEventListener("pointerover", (e) => {
      const a = e.target.closest(".prow__link");
      if (a) { activate(a); list.classList.add("is-hovering"); }
    });
    list.addEventListener("pointerleave", () => list.classList.remove("is-hovering"));
    list.addEventListener("focusin", (e) => activate(e.target.closest(".prow__link")));
    activate($(".prow__link", list));

    const nav = $("[data-filters]");
    if (!nav) return;
    nav.hidden = false;
    const btns = $$("[data-filter]", nav);
    const rows = $$(".prow", list);
    const apply = (cat, push) => {
      btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === cat)));
      let k = 0;
      rows.forEach((r) => {
        const show = cat === "all" || r.dataset.cat === cat;
        r.classList.toggle("is-hidden", !show);
        if (show && !reduced.matches) {
          r.style.animation = "none";
          void r.offsetWidth;
          r.style.animation = `rise .6s var(--ease) ${k++ * 45}ms both`;
        }
      });
      const first = rows.find((r) => !r.classList.contains("is-hidden"));
      if (first) activate($(".prow__link", first));
      const track = $("[data-track]", nav);
      if (track) track.dispatchEvent(new Event("track:update"));
      if (push) history.replaceState(null, "", cat === "all" ? location.pathname : `#${cat}`);
    };
    btns.forEach((b) => b.addEventListener("click", () => apply(b.dataset.filter, true)));
    const h = location.hash.slice(1);
    if (btns.some((b) => b.dataset.filter === h)) apply(h, false);
  }

  /* ------------------------------------------------------------ view transitions */

  // The image you click travels into the case-study hero. Only one element
  // per page may carry the name, so it moves to the clicked card's image.
  function vtLinks() {
    if (!("onpagereveal" in window)) return;
    d.addEventListener("click", (e) => {
      const a = e.target.closest("[data-vt-link]");
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      let img = $("img", a);
      if (a.classList.contains("prow__link") && matchMedia("(min-width: 64em)").matches) {
        img = $(`[data-slide="${a.dataset.preview}"] img`);
      }
      if (!img) return;
      $$("img").forEach((el) => { if (el.style.viewTransitionName) el.style.viewTransitionName = ""; });
      img.style.viewTransitionName = "hero-media";
    });
    addEventListener("pageshow", (e) => {
      if (!e.persisted) return;
      $$("[data-vt-link] img").forEach((el) => { el.style.viewTransitionName = ""; });
      const hero = $(".cs__img");
      if (hero) hero.style.viewTransitionName = "hero-media";
    });
  }

  /* ------------------------------------------------------------ case-study contents */

  function toc() {
    const box = $("[data-toc]");
    const prose = $("[data-prose]");
    if (!box || !prose) return;
    const hs = $$(":scope > h2[id]", prose);
    if (hs.length < 2) return;
    const list = $("[data-toc-list]", box);
    list.innerHTML = hs.map((h) => `<li><a href="#${esc(h.id)}">${esc(h.textContent)}</a></li>`).join("");
    const line = d.createElement("span");
    line.className = "toc__line";
    line.setAttribute("aria-hidden", "true");
    list.append(line);
    box.hidden = false;
    const links = $$("a", list);
    let last = -2;
    const setActive = (i) => {
      if (i === last) return;
      last = i;
      links.forEach((a, j) => {
        a.classList.toggle("is-active", i === j);
        if (i === j) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
      });
      const a = links[i];
      if (a) {
        line.style.transform = `translateY(${a.offsetTop}px)`;
        line.style.height = `${a.offsetHeight}px`;
        line.classList.add("is-on");
      } else line.classList.remove("is-on");
    };
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = innerHeight * 0.32;
        let idx = -1;
        hs.forEach((h, i) => { if (h.getBoundingClientRect().top < y) idx = i; });
        setActive(idx);
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------ media */

  function videos() {
    d.addEventListener("click", (e) => {
      const a = e.target.closest("[data-video-id]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      const frame = d.createElement("div");
      frame.className = "video__frame";
      frame.innerHTML =
        `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(a.dataset.videoId)}?autoplay=1&rel=0&playsinline=1" ` +
        `title="${esc(a.dataset.videoTitle)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
        `allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
      a.replaceWith(frame);
      $("iframe", frame).focus();
    });

    // Short demo clips play while on screen (muted loops), never with reduced motion.
    const vids = $$("video[data-deferred-video]");
    if (!vids.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      const v = en.target;
      if (en.isIntersecting) {
        if (v.preload === "none") v.preload = "auto";
        if (v.dataset.autoplay === "true" && !reduced.matches) v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    }), { rootMargin: "120px 0px" });
    vids.forEach((v) => io.observe(v));
  }

  /* ------------------------------------------------------------ reveals */

  // Only elements that start below the fold wait to be revealed, so the first
  // screen is never hidden and nothing depends on this script having run.
  function reveal() {
    if (reduced.matches || !("IntersectionObserver" in window)) return;
    const vh = innerHeight;
    const els = $$(".reveal").filter((el) => el.getBoundingClientRect().top > vh);
    if (!els.length) return;
    els.forEach((el) => el.classList.add("reveal--wait"));
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.remove("reveal--wait");
      io.unobserve(en.target);
    }), { rootMargin: "0px 0px 40px 0px" });
    els.forEach((el) => io.observe(el));
    // Jumping to an anchor shouldn't leave content behind waiting.
    addEventListener("hashchange", () => {
      const target = location.hash && d.getElementById(location.hash.slice(1));
      if (target) $$(".reveal--wait", target).concat(target.classList.contains("reveal--wait") ? [target] : []).forEach((el) => el.classList.remove("reveal--wait"));
    });
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

    const arrow = '<svg class="i cmdk__go" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8h11M9.5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const search = '<svg class="i" width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12.5 12.5l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

    const commands = [
      ...data.pages.map((p) => ({ group: "Pages", label: p.label, url: p.url })),
      ...data.projects.map((p) => ({ group: "Projects", label: p.label, url: p.url, meta: p.meta })),
      ...data.posts.map((p) => ({ group: "Writing", label: p.label, url: p.url, meta: p.meta, ext: true })),
      { group: "Actions", label: "Copy email address", meta: data.email, run: () => copyText(data.email, "Email address copied") },
      { group: "Actions", label: "Toggle dark mode", keys: "theme light", run: () => toggleTheme() },
      { group: "Actions", label: "Download résumé (PDF)", keys: "resume cv", url: data.resume },
      { group: "Actions", label: "Book a 30-minute call", keys: "calendly meeting schedule", url: data.schedule, ext: true },
      { group: "Actions", label: "Send an email", keys: "contact mail", url: `mailto:${data.email}` },
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
        html += `<li class="cmdk__item" role="option" id="cmdk-${i}" data-i="${i}" aria-selected="false"><span>${mark(c.label, words[0])}</span>${c.meta ? `<span class="cmdk__meta">${esc(c.meta)}</span>` : ""}${arrow}</li>`;
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

  theme();
  clock();
  header();
  menu();
  projectsIndex();
  sectionSpy();
  tracks();
  signal();
  timeline();
  vtLinks();
  toc();
  videos();
  copy();
  cmdk();
  reveal();
})();
