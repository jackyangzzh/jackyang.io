/* FULL STOP — a twenty-second showreel for jackyang.io, played as Fig. 1
 * on the site's cover.
 *
 * One red square carries the whole film. It is the live lamp, the agent
 * waiting for its turn, an aperture onto Mesh, the joints of a tracked hand,
 * the mark on an AI's hidden mistake, and, finally, the full stop on
 * "Real-time AI for real conversations." The film ends on the cover itself,
 * so when it stops the page is already there.
 *
 * Everything is a pure function of time: window.__seek(t) draws frame t.
 * The 2D canvas composes; one WebGL pass adds lens, grain and glitch.
 */
(() => {
'use strict';

/* ------------------------------------------------------------ canvas */
const q = new URLSearchParams(location.search);
const W = +(q.get('w') || 1920), H = +(q.get('h') || 1080);
const VW = 1920, VH = 1080, K = W / VW;
const DUR = 20, FPS = 60;
if (q.has('render')) document.body.classList.add('render');

const cv = document.createElement('canvas');
cv.width = W; cv.height = H;
const c = cv.getContext('2d');
const out = document.getElementById('out');
out.width = W; out.height = H;
if (!q.has('render')) { out.style.width = '100vw'; out.style.height = 'calc(100vw * 9 / 16)'; }

/* ------------------------------------------------------------ tokens */
/* The site's night tokens. Red is the live signal; FakeHaul keeps its own orange. */
const BG = '#000000', INK = '#EDEAE4', INK2 = '#BAB6AF', MUTED = '#8C887F', SIG = '#E5291F', FH = '#F4622E';
const LINE = 'rgba(237,234,228,.14)';
/* One family, two postures: DISPLAY is Archivo at full width in capitals,
 * TEXT is Archivo at normal width for the small spaced labels. */
const DISPLAY = 'display', TEXT = 'text';
const CX = VW / 2, CY = VH / 2;

/* ------------------------------------------------------------- maths */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  out3: (p) => 1 - Math.pow(1 - p, 3),
  in3: (p) => p * p * p,
  io3: (p) => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  outX: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  inX: (p) => (p <= 0 ? 0 : Math.pow(2, 10 * p - 10)),
  ioX: (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < .5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2),
  back: (p, s = 1.7) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2),
  spring: (p, f = 4.5, d = 5) => (p <= 0 ? 0 : 1 - Math.exp(-d * p) * Math.cos(f * Math.PI * p)),
};
const decay = (t, at, k = 10) => (t < at ? 0 : Math.exp(-(t - at) * k));
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/* ----------------------------------------------------------- footage */
let CLIPS = {};
const cache = new Map();
const need = new Set();
function frame(name, lt) {
  const m = CLIPS[name];
  if (!m) return null;
  const i = clamp(Math.floor(lt * 30), 0, m.n - 1) + 1;
  const key = `${name}/${String(i).padStart(4, '0')}`;
  const im = cache.get(key);
  if (im) return im;
  need.add(key);
  return null;
}
function load(key) {
  return new Promise((res) => {
    const im = new Image();
    im.onload = () => { im.decode().catch(() => {}).then(() => { cache.set(key, im); res(); }); };
    im.onerror = () => res();
    im.src = `media/frames/${key}.jpg`;
  });
}
function trimCache() {
  if (cache.size < 500) return;
  const keys = [...cache.keys()];
  for (let i = 0; i < keys.length - 300; i++) cache.delete(keys[i]);
}

/* Cover-fit footage into a box, zoomed around a focal point. */
function footage(name, lt, x, y, w, h, o = {}) {
  const im = frame(name, lt);
  if (!im) return;
  const z = o.zoom || 1, fx = o.fx ?? .5, fy = o.fy ?? .5;
  const s = Math.max(w / im.width, h / im.height) * z;
  const dw = im.width * s, dh = im.height * s;
  const dx = x + (w - dw) * fx, dy = y + (h - dh) * fy;
  c.save();
  c.beginPath(); rr(x, y, w, h, o.r || 0); c.clip();
  if (o.filter) c.filter = o.filter;
  c.globalAlpha *= o.alpha ?? 1;
  c.drawImage(im, dx, dy, dw, dh);
  c.restore();
}
/* Where a rectangle of the source frame lands on screen, for a footage() call. */
function mapSrc(name, box, o, src) {
  const m = CLIPS[name];
  const z = o.zoom || 1, fx = o.fx ?? .5, fy = o.fy ?? .5;
  const s = Math.max(box.w / m.w, box.h / m.h) * z;
  const dx = box.x + (box.w - m.w * s) * fx, dy = box.y + (box.h - m.h * s) * fy;
  return { x: dx + src.x * s, y: dy + src.y * s, w: src.w * s, h: src.h * s };
}
function rr(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  if (r <= 0) { c.rect(x, y, w, h); return; }
  c.roundRect(x, y, w, h, r);
}

/* -------------------------------------------------------------- type */
function font(size, fam = DISPLAY, style = '', weight) {
  const disp = fam !== TEXT;
  c.font = `${weight ?? (disp ? 850 : 600)} ${size}px Archivo, Arial, sans-serif`;
  c.fontStretch = disp ? 'expanded' : 'normal'; // after c.font: setting the font resets it
}
const UP = (t) => String(t).toUpperCase();
function mono(text, x, y, o = {}) {
  if (!o.keep) return;
  c.save();
  font(o.size || 18, TEXT, '', o.weight || 600);
  c.letterSpacing = `${o.track ?? .08}em`;
  c.fillStyle = o.color || INK;
  c.globalAlpha *= o.alpha ?? 1;
  c.textAlign = o.align || 'left';
  c.textBaseline = 'alphabetic';
  c.fillText(o.upper === false ? text : text.toUpperCase(), x, y);
  c.restore();
}
/* Mono text that types on, a character at a time, with a block caret. */
function typed(text, x, y, p, o = {}) {
  const n = Math.floor(text.length * clamp(p));
  mono(text.slice(0, n), x, y, o);
  if (p > 0 && p < 1) {
    c.save(); font(o.size || 18, TEXT); c.letterSpacing = `${o.track ?? .08}em`;
    const w = c.measureText((o.upper === false ? text : text.toUpperCase()).slice(0, n)).width;
    c.fillStyle = o.caret || SIG; c.fillRect(x + w + 2, y - (o.size || 18) * .78, (o.size || 18) * .55, (o.size || 18) * .95);
    c.restore();
  }
}
/* A line of display type rising out of its own mask. Parts: [{t, it, color}]. */
function rise(parts, x, y, size, p, o = {}) {
  if (p <= 0) return 0;
  const maxW = o.maxW ?? (VW - x - 110);
  const full = measure(parts, size);
  if (full > maxW) size *= maxW / full;
  const e = o.ease ? o.ease(p) : E.outX(p);
  c.save();
  c.beginPath(); c.rect(x - size, y - size * 1.05, VW * 2, size * 1.38); c.clip();
  let cx = x;
  const dy = (1 - e) * size * 1.15 + (o.exit ? -E.inX(o.exit) * size * 1.2 : 0);
  for (const pt of parts) {
    font(size, pt.fam || DISPLAY, '', pt.w);
    c.letterSpacing = pt.track || '-0.035em';
    c.fillStyle = pt.color || o.color || INK;
    c.globalAlpha = o.alpha ?? 1;
    c.fillText(UP(pt.t), cx, y + dy);
    cx += c.measureText(UP(pt.t)).width;
  }
  c.restore();
  return cx - x;
}
function measure(parts, size) {
  let w = 0;
  for (const pt of parts) { font(size, pt.fam || DISPLAY, '', pt.w); c.letterSpacing = pt.track || '-0.035em'; w += c.measureText(UP(pt.t)).width; }
  c.letterSpacing = '0px';
  return w;
}
/* Big word, letters popping in on a stagger with a spring. */
function pop(text, x, y, size, t, o = {}) {
  text = UP(text);
  c.save();
  font(size, o.fam || DISPLAY, '', o.w);
  c.letterSpacing = o.track || '-0.035em';
  const fitW = o.maxW ?? VW - 240;
  if (c.measureText(text).width > fitW) { size *= fitW / c.measureText(text).width; font(size, o.fam || DISPLAY, '', o.w); }
  c.textBaseline = 'alphabetic';
  const total = c.measureText(text).width;
  let cx = o.align === 'center' ? x - total / 2 : x;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const w = c.measureText(ch).width;
    const p = seg(t, i * (o.stagger ?? .03), i * (o.stagger ?? .03) + (o.dur ?? .45));
    if (p > 0) {
      const s = E.spring(p, 3.2, 6.5);
      const ex = o.exit ? E.inX(o.exit) : 0;
      c.save();
      c.translate(cx + w / 2, y - (1 - s) * size * .5 - ex * size * .9);
      c.rotate((1 - s) * .25 * (i % 2 ? 1 : -1));
      c.globalAlpha = clamp(p * 4) * (1 - ex);
      c.fillStyle = o.color || INK;
      c.fillText(ch, -w / 2, 0);
      c.restore();
    }
    cx += w;
  }
  c.restore();
}

/* ------------------------------------------------------------ shapes */
function dot(x, y, r, color = SIG, glow = 0) {
  c.save();
  if (glow > 0) {
    const g = c.createRadialGradient(x, y, 0, x, y, r * 7);
    g.addColorStop(0, `rgba(229,41,31,${.42 * glow})`);
    g.addColorStop(1, 'rgba(229,41,31,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 7, 0, Math.PI * 2); c.fill();
  }
  r = Math.max(0, r);
  c.fillStyle = color; c.fillRect(x - r, y - r, r * 2, r * 2);
  c.restore();
}
/* A square drawn round its perimeter from the top centre, clockwise, to p. */
function squareProgress(cx, cy, h, p, color = SIG, w = 4) {
  if (p <= 0) return;
  const pts = [[cx, cy - h], [cx + h, cy - h], [cx + h, cy + h], [cx - h, cy + h], [cx - h, cy - h], [cx, cy - h]];
  const lens = [h, 2 * h, 2 * h, 2 * h, h];
  let left = p * 8 * h;
  c.save(); c.strokeStyle = color; c.lineWidth = w; c.lineCap = 'square';
  c.beginPath(); c.moveTo(...pts[0]);
  for (let i = 0; i < 5 && left > 0; i++) {
    const k = Math.min(1, left / lens[i]);
    c.lineTo(lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k));
    left -= lens[i];
  }
  c.stroke(); c.restore();
}
function ring(x, y, r, a, w = 2, color = SIG) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.strokeStyle = color; c.lineWidth = w;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke(); c.restore();
}
/* Corner brackets: the "this is what I built" mark. */
function brackets(x, y, w, h, p, color = SIG, len = 34, lw = 3) {
  if (p <= 0) return;
  const e = E.outX(p), l = len * e, pad = (1 - e) * 40;
  x -= pad; y -= pad; w += pad * 2; h += pad * 2;
  c.save(); c.strokeStyle = color; c.lineWidth = lw; c.globalAlpha = clamp(p * 3); c.lineCap = 'square';
  c.beginPath();
  c.moveTo(x, y + l); c.lineTo(x, y); c.lineTo(x + l, y);
  c.moveTo(x + w - l, y); c.lineTo(x + w, y); c.lineTo(x + w, y + l);
  c.moveTo(x + w, y + h - l); c.lineTo(x + w, y + h); c.lineTo(x + w - l, y + h);
  c.moveTo(x + l, y + h); c.lineTo(x, y + h); c.lineTo(x, y + h - l);
  c.stroke(); c.restore();
}
function scrim(y0, y1, a0, a1) {
  const g = c.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, `rgba(0,0,0,${a0})`); g.addColorStop(1, `rgba(0,0,0,${a1})`);
  c.fillStyle = g; c.fillRect(0, Math.min(y0, y1), VW, Math.abs(y1 - y0));
}
function fill(color, a = 1) { c.save(); c.globalAlpha = a; c.fillStyle = color; c.fillRect(0, 0, VW, VH); c.restore(); }

/* ======================================================== THE  FILM == */
/* Section boundaries (seconds). 120 BPM: a beat is .5 s, a bar is 2 s. */
const T = {
  strike: 1.0, wait: 1.5, speak: 2.0,
  teams: 2.5, teamsFull: 3.4, recap: 4.35, squeeze: 4.95, mesh: 5.3,
  cuts: 6.15, langs: 7.15, ignite: 7.95,
  holos: 9.85, pinch: 10.65, holHands: 11.35, hol750: 12.3,
  count: 12.45, roll: 13.35, fake: 14.0, press: 15.1,
  strobe: 17.15, still: 17.5, hero: 17.95, land: 18.65, end: 19.85,
};
const IMPACTS = [T.strike, T.speak, T.teams, T.teamsFull, T.recap, T.mesh + .5, T.cuts, T.langs, T.ignite, T.holos, T.pinch, T.hol750, T.fake, T.press + .04, T.press + .24, T.press + .44, T.land];
/* Hard cuts between chapters become wipes: a black slab with a red leading
 * edge crosses the frame, covering the outgoing shot and uncovering the next,
 * the way the site's pages change. */
const WIPES = [T.press, T.strobe];

let R0 = 12;             // dot radius = the period of "conversations." (measured on load)
let PERIOD = { x: 0, y: 0 };
const HERO = { x: 150, size: 200, base: [430, 610, 790], lines: [] };

/* ---------------------------------------------------- 0 · THE DOT */
/* Voice amplitude at time tau: two people, a pause, then the agent. */
function voice(tau) {
  if (tau < T.strike) return { a: 0, who: 0 };
  if (tau < T.wait) {
    const who = tau < 1.27 ? 1 : 2;
    const syl = Math.pow(Math.max(0, Math.sin(tau * 2 * Math.PI * (who === 1 ? 6.2 : 7.4))), .5);
    const gap = tau > 1.24 && tau < 1.3 ? .1 : 1;
    return { a: (0.35 + .65 * syl) * (0.55 + .45 * Math.sin(tau * 9.1)) * gap * E.out3(seg(tau, 1.0, 1.08)), who };
  }
  if (tau < T.speak) return { a: .015 * Math.sin(tau * 40), who: 0 };
  const syl = Math.pow(Math.max(0, Math.sin(tau * 2 * Math.PI * 5.6)), .45);
  return { a: (0.45 + .55 * syl) * E.out3(seg(tau, 2.0, 2.06)), who: 3 };
}
function sceneOpen(t) {
  fill(BG);
  const strike = seg(t, T.strike, T.strike + .16);
  /* Heartbeat before the strike. */
  const beat = decay(t, 0, 9) * 0 + decay(t, .5, 9) + decay(t, 0.75, 12) * .5;
  if (t < T.strike) {
    ring(CX, CY, R0 + E.outX(seg(t, .5, 1.2)) * 260, (1 - seg(t, .5, 1.2)) * .5, 1.5);
    ring(CX, CY, R0 + E.outX(seg(t, .75, 1.3)) * 160, (1 - seg(t, .75, 1.3)) * .35, 1);
    const wind = E.inX(seg(t, .85, 1.0));
    dot(CX, CY, R0 * (1 + beat * .45 - wind * .3), SIG, .6 + beat);
    /* A tiny live readout, the first words on screen. */
    mono('live', CX + 34, CY + 6, { size: 15, color: MUTED, alpha: seg(t, .1, .3) * (1 - wind) });
    return;
  }
  /* The strike: the dot snaps into a line, then the line starts listening. */
  const v = 1500; // px per second the waveform travels left
  c.save();
  const half = E.outX(strike) * CX;
  c.strokeStyle = 'rgba(237,234,228,.22)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(CX, CY); c.lineTo(CX + half, CY); c.stroke();
  /* Past: filled, mirrored waveform, the way Fig. 1 draws a meeting. */
  const pts = [];
  for (let x = CX; x >= CX - half - 4; x -= 3) {
    const tau = t - (CX - x) / v;
    const { a, who } = voice(tau);
    const car = .55 + .45 * Math.abs(Math.sin(tau * 190)) * (0.6 + .4 * Math.sin(tau * 31));
    let amp = a * car * 210;
    if (who === 3) amp *= 1 + E.inX(seg(t, 2.25, T.teams)) * 6;
    pts.push([x, amp, who]);
  }
  for (const who of [1, 2, 3]) {
    c.beginPath();
    let open = false;
    for (const [x, amp, w] of pts) { if (w === who) { open ? c.lineTo(x, CY - amp) : c.moveTo(x, CY - amp); open = true; } }
    for (let i = pts.length - 1; i >= 0; i--) { const [x, amp, w] = pts[i]; if (w === who) c.lineTo(x, CY + amp); }
    if (!open) continue;
    c.closePath();
    if (who === 3) { c.fillStyle = SIG; c.fill(); }
    else { c.fillStyle = 'rgba(237,234,228,.08)'; c.fill(); c.strokeStyle = who === 1 ? INK : INK2; c.lineWidth = 1.6; c.stroke(); }
  }
  c.beginPath();
  c.strokeStyle = 'rgba(237,234,228,.5)'; c.lineWidth = 1.5;
  for (const [x, amp, w] of pts) if (w === 0) { c.moveTo(x, CY); c.lineTo(x - 3, CY); }
  c.stroke();
  c.restore();

  /* The words, in time with the turns. */
  const ws = 240, wy = 380;
  if (t < T.wait + .1) pop('Listen.', CX, wy, ws, t - T.strike, { align: 'center', exit: seg(t, T.wait - .05, T.wait + .1), stagger: .025 });
  if (t > T.wait - .02 && t < T.speak + .1) pop('Wait.', CX, wy, ws, t - T.wait + .02, { align: 'center', color: INK2, exit: seg(t, T.speak - .05, T.speak + .1), stagger: .03 });
  if (t > T.speak - .02) pop('Speak.', CX, wy, ws, t - T.speak + .02, { align: 'center', color: SIG, stagger: .025 });

  /* Speaker tags travel with their audio. */
  const tag = (label, tau0, color) => { const x = CX - (t - tau0) * v; if (x > -200 && x < CX - 10) mono(label, x, CY + 190, { size: 15, color }); };
  tag('Ana', 1.02, INK2); tag('Raj', 1.28, INK2); tag('Agent', 2.0, SIG);

  /* The pause, measured. The agent waits for it. */
  if (t >= T.wait) {
    const pz = Math.min(t, T.speak) - T.wait;
    mono(`pause ${pz.toFixed(2)} s`, CX + 30, CY + 52, { size: 17, color: t < T.speak ? INK : MUTED, alpha: seg(t, T.wait, T.wait + .05) * (1 - seg(t, 2.3, 2.45)) });
    if (t < T.speak) {
      c.save(); c.globalAlpha = .9; squareProgress(CX, CY, 30, pz / .5, SIG, 2); c.restore();
    }
  }
  /* The dot rides the playhead: listening, waiting, then speaking. */
  const talk = t > T.speak ? voice(t).a : 0;
  const breathe = t > T.wait && t < T.speak ? .12 * Math.sin((t - T.wait) * 25) : 0;
  const r = R0 * (lerp(2, 1, E.outX(strike)) + breathe + talk * .6) * (1 - E.inX(seg(t, 2.3, T.teams)));
  dot(CX, CY, r, SIG, .8);
  /* The agent's voice floods the frame. */
  fill(SIG, E.inX(seg(t, 2.32, T.teams)));
}

/* ----------------------------------------------- 1 · TEAMS AI */
const TILES = [
  { clip: 'fac-gallery', label: 'Live in the meeting', fy: .5 },
  { clip: 'fac-ask', label: 'Answers in chat', fy: .5 },
  { clip: 'fac-recap', label: 'Tracks decisions', fy: .3 },
  { clip: 'fac-notes', label: 'Takes the notes', fy: .5 },
];
function sceneTeams(t) {
  fill(BG);
  const lt = t - T.teams + .2;
  const M = 96, G = 22, tw = (VW - M * 2 - G) / 2, th = (VH - M * 2 - G - 40) / 2;
  if (t < T.teamsFull + .45) {
    TILES.forEach((tile, i) => {
      const p = E.outX(seg(t, T.teams + i * .045, T.teams + i * .045 + .5));
      const gx = M + (i % 2) * (tw + G), gy = M + 20 + Math.floor(i / 2) * (th + G);
      /* After the grid, the first tile takes the frame; the others leave. */
      const tk = E.ioX(seg(t, T.teamsFull - .08, T.teamsFull + .32));
      let x = lerp(0, gx, p), y = lerp(0, gy, p), w = lerp(VW, tw, p), h = lerp(VH, th, p);
      if (i === 0) { x = lerp(x, 0, tk); y = lerp(y, 0, tk); w = lerp(w, VW, tk); h = lerp(h, VH, tk); }
      else { x += (i % 2 ? 1 : -1) * tk * 1100; y += (i > 1 ? 1 : -1) * tk * 700; }
      footage(tile.clip, lt + i * .3, x, y, w, h, { fy: tile.fy, zoom: i === 0 ? lerp(1, 1.04, tk) : 1.02 });
      c.save(); c.beginPath(); rr(x, y, w, h, 0); c.clip();
      fill(SIG, 1 - E.out3(seg(t, T.teams + i * .045, T.teams + i * .045 + .3)));
      c.restore();
      if (false && p > .6 && tk < .5) {
        c.save(); c.globalAlpha = (1 - tk * 2);
        c.fillStyle = 'rgba(0,0,0,.82)'; c.beginPath(); rr(x + 16, y + h - 50, 290, 34, 0); c.fill();
        dot(x + 32, y + h - 33, 5, SIG);
        mono(tile.label, x + 46, y + h - 27, { size: 15, alpha: seg(t, T.teams + .3 + i * .06, T.teams + .5 + i * .06) });
        c.restore();
      }
    });
  }
  if (t >= T.teamsFull + .45 && t < T.recap) footage('fac-gallery', lt, 0, 0, VW, VH, { zoom: 1.04 + (t - T.teamsFull) * .05 });
  if (t >= T.teamsFull && t < T.recap) {
    scrim(VH * .45, VH, 0, .92);
    const p = t - T.teamsFull - .12;
    mono('■ Facilitator · Microsoft 365 Copilot', HERO.x, 712, { size: 19, color: INK, alpha: seg(p, 0, .1) });
    rise([{ t: 'Deciding when' }], HERO.x - 6, 850, 138, seg(p, .02, .38), { exit: seg(t, T.recap - .12, T.recap) });
    rise([{ t: 'the AI ' }, { t: 'speaks.', color: SIG }], HERO.x - 6, 975, 138, seg(p, .08, .44), { exit: seg(t, T.recap - .12, T.recap) });
  }
  if (t >= T.recap) {
    /* The recap: a slow push toward the agent's decisions list. */
    const p = seg(t, T.recap, T.squeeze + .25);
    const sq = E.io3(seg(t, T.squeeze, T.mesh));
    const w = lerp(VW, R0 * 2, sq), h = lerp(VH, R0 * 2, sq);
    const x = CX - w / 2, y = CY - h / 2;
    const o = { zoom: 1.12 + p * .16, fx: .72, fy: .3 };
    footage('fac-recap', lt, x, y, w, h, o);
    c.save(); c.beginPath(); rr(x, y, w, h, 0); c.clip(); fill(SIG, E.inX(seg(t, T.squeeze + .05, T.mesh))); c.restore();
    if (sq < .05) {
      scrim(VH * .62, VH, 0, .85);
      const b = mapSrc('fac-recap', { x: 0, y: 0, w: VW, h: VH }, o, { x: 598, y: 136, w: 360, h: 455 });
      brackets(b.x, b.y, b.w, b.h, seg(t, T.recap + .08, T.recap + .35));
      mono('Key decisions, tracked live', b.x, b.y - 22, { size: 17, color: SIG, alpha: seg(t, T.recap + .15, T.recap + .3) });
      rise([{ t: 'Microsoft Teams AI' }], HERO.x - 6, 960, 120, seg(t, T.recap + .05, T.recap + .4));
    }
  }
}

/* ------------------------------------------------------ 2 · MESH */
const LANGS = ['Hello', 'Hola', 'Bonjour', 'Hallo', 'Ciao', 'Olá', 'こんにちは', '你好', '안녕하세요', 'Привет', 'Merhaba', 'Hej', 'Cześć', 'Ahoj', 'Γεια σου', 'Szia', 'Hei', 'Xin chào', 'Halo', 'שלום', 'مرحبا', 'नमस्ते'];
const RUNTIMES = ['HoloLens', 'Quest', 'Web', 'Desktop'];
function sceneMesh(t) {
  fill(BG);
  const lt = t - T.mesh;
  /* Iris: the dot opens onto a Mesh world, ringed by a frame-budget dial. */
  if (t < T.cuts) {
    const p1 = E.outX(seg(t, T.mesh, T.mesh + .3));           // dot to lens
    const p2 = E.ioX(seg(t, T.mesh + .42, T.cuts));            // lens to frame
    const r = lerp(R0, 150, p1) + p2 * 1150;
    c.save(); c.beginPath(); c.rect(CX - r, CY - r, r * 2, r * 2); c.clip();
    footage('mesh-space', lt + .3, 0, 0, VW, VH, { zoom: 1.35 - p2 * .3 });
    fill(SIG, 1 - E.out3(seg(t, T.mesh, T.mesh + .25)));
    c.restore();
    const da = 1 - seg(t, T.mesh + .5, T.mesh + .65);
    if (da > 0) {
      c.save(); c.globalAlpha = da;
      const ms = 16.6 * clamp(seg(t, T.mesh + .05, T.mesh + .45));
      c.strokeStyle = 'rgba(237,234,228,.25)'; c.lineWidth = 1; c.strokeRect(CX - r - 40, CY - r - 40, (r + 40) * 2, (r + 40) * 2);
      squareProgress(CX, CY, r + 40, ms / 16.6, SIG, 4);
      mono(`${ms.toFixed(1)} ms`, CX + r + 80, CY - 6, { size: 30, weight: 700 });
      mono('frame budget · 60 fps', CX + r + 80, CY + 26, { size: 15, color: MUTED });
      c.restore();
    }
    mono('■ Microsoft Mesh · 2022–2024', HERO.x, 136, { size: 19, alpha: seg(t, T.mesh + .1, T.mesh + .2) });
    scrim(VH * .55, VH, 0, .75 * seg(t, T.mesh + .4, T.cuts));
    rise([{ t: 'One avatar,' }], HERO.x - 6, 900, 150, seg(t, T.mesh + .25, T.mesh + .6));
    return;
  }
  /* Four cuts on the eighths: the same avatar across runtimes. */
  if (t < T.langs) {
    const cuts = [['av-call', .3, .5], ['mesh-garden', .2, .55], ['mesh-vr', .2, .4], ['av-editor', .7, .5]];
    const CUT = (T.langs - T.cuts) / 4;
    const k = Math.min(3, Math.floor((t - T.cuts) / CUT));
    const [clip, off, fy] = cuts[k];
    const kt = t - T.cuts - k * CUT;
    footage(clip, off + kt * 1.1, 0, 0, VW, VH, { zoom: 1.12 - kt * .25, fy });
    fill('#fff', decay(t, T.cuts + k * CUT, 30) * .25);
    scrim(VH * .5, VH, 0, .85);
    mono('■ Microsoft Mesh', HERO.x, 136, { size: 19 });
    rise([{ t: 'One avatar,' }], HERO.x - 6, 790, 150, 1, { exit: seg(t, T.langs - .14, T.langs), maxW: 880 });
    rise([{ t: 'every runtime.' }], HERO.x - 6, 935, 150, seg(t, T.cuts, T.cuts + .35), { exit: seg(t, T.langs - .14, T.langs), maxW: 880 });
    /* The runtimes, with the site's gliding underline. */
    c.save(); font(19, TEXT); c.letterSpacing = '.08em';
    let x = 1180; const xs = [];
    for (const r of RUNTIMES) { const w = c.measureText(r.toUpperCase()).width; xs.push([x, w]); x += w + 44; }
    c.restore();
    void xs;
    return;
  }
  /* Twenty-plus languages, shipped weekly. */
  if (t < T.ignite) {
    const p = seg(t, T.langs, T.ignite);
    footage('av-grid', t - T.langs + .2, 0, 0, VW, VH, { zoom: 1.08 + p * .12, filter: 'saturate(.6) brightness(.32) blur(2px)' });
    /* The greeting flips faster and faster, then lands. */
    const land = T.langs + .5;
    let idx;
    if (t < land) { const u = seg(t, T.langs, land); idx = Math.floor(Math.pow(u, .62) * 21) + 1; } else idx = 0;
    const word = LANGS[idx % LANGS.length];
    const pulse = t < land ? 0 : E.spring(seg(t, land, land + .3));
    c.save(); c.textAlign = 'center';
    font(200 * (t < land ? 1 : lerp(1.15, 1, pulse)), DISPLAY);
    c.letterSpacing = '-0.035em';
    c.fillStyle = INK;
    c.fillText(UP(word), CX, CY + 70);
    c.restore();
    return;
  }
  /* Ignite: the outfit picker on stage behind Satya Nadella. */
  const p = seg(t, T.ignite, T.holos);
  const o = { zoom: 1.1 + p * .1, fx: .55, fy: .3 };
  footage('ign-outfit', 1.1 + (t - T.ignite) * .9, 0, 0, VW, VH, o);
  fill('#fff', decay(t, T.ignite, 25) * .3);
  scrim(VH * .58, VH, 0, .9);
  const b = mapSrc('ign-outfit', { x: 0, y: 0, w: VW, h: VH }, o, { x: 596, y: 136, w: 268, h: 306 });
  brackets(b.x, b.y, b.w, b.h, seg(t, T.ignite + .12, T.ignite + .4), INK);
  mono('Outfit selection · I built this', b.x, b.y - 22, { size: 16, color: INK, alpha: seg(t, T.ignite + .2, T.ignite + .35) });
  mono('■ Microsoft Ignite', HERO.x, 776, { size: 19, alpha: seg(t, T.ignite + .05, T.ignite + .15) });
  rise([{ t: 'My outfit picker,' }], HERO.x - 6, 900, 104, seg(t, T.ignite + .08, T.ignite + .45), { exit: seg(t, T.holos - .3, T.holos - .12) });
  rise([{ t: 'shown by Satya Nadella.' }], HERO.x - 6, 1000, 104, seg(t, T.ignite + .14, T.ignite + .5), { exit: seg(t, T.holos - .28, T.holos - .1) });
  /* Close down to the dot again. */
  const cl = E.io3(seg(t, T.holos - .32, T.holos));
  if (cl > 0) { const h = lerp(1100, R0, cl); c.save(); c.globalCompositeOperation = 'destination-in'; c.fillRect(CX - h, CY - h, h * 2, h * 2); c.restore(); c.save(); c.globalCompositeOperation = 'destination-over'; fill(BG); c.restore(); }
}

/* ----------------------------------------------------- 3 · HOLOS */
const HAND_OPEN = [[0, 0], [-.12, -.08], [-.22, -.18], [-.29, -.27], [-.35, -.34], [-.1, -.36], [-.12, -.52], [-.13, -.62], [-.14, -.71], [0, -.38], [0, -.56], [0, -.67], [0, -.77], [.09, -.35], [.11, -.51], [.12, -.61], [.13, -.69], [.17, -.3], [.21, -.42], [.23, -.5], [.25, -.57]];
const HAND_PINCH = [[0, 0], [-.12, -.08], [-.2, -.2], [-.23, -.32], [-.235, -.44], [-.1, -.36], [-.15, -.5], [-.2, -.52], [-.235, -.455], [0, -.38], [-.02, -.54], [-.05, -.6], [-.07, -.56], [.09, -.35], [.08, -.5], [.05, -.55], [.03, -.5], [.17, -.3], [.18, -.42], [.15, -.46], [.12, -.43]];
const BONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]];
function handPts(t) {
  const pin = E.ioX(seg(t, T.pinch - .32, T.pinch));
  const s = 640, ox = CX + 40, oy = CY + 330;
  const sway = Math.sin((t - T.holos) * 3) * .05;
  return HAND_OPEN.map((o, i) => {
    const pp = HAND_PINCH[i];
    let x = lerp(o[0], pp[0], pin), y = lerp(o[1], pp[1], pin);
    const rx = x * Math.cos(sway) - y * Math.sin(sway), ry = x * Math.sin(sway) + y * Math.cos(sway);
    return [ox + rx * s, oy + ry * s];
  });
}
function sceneHolos(t) {
  fill(BG);
  const pinchAt = handPts(T.pinch)[8];
  const pinchPt = [(pinchAt[0] + handPts(T.pinch)[4][0]) / 2, (pinchAt[1] + handPts(T.pinch)[4][1]) / 2];
  if (t < T.pinch + .45) {
    /* The dot splits into twenty-one joints. */
    const pts = handPts(t);
    const fade = 1 - seg(t, T.pinch + .15, T.pinch + .4);
    c.save(); c.globalAlpha = fade;
    /* Faint tracking grid behind the hand. */
    c.strokeStyle = 'rgba(237,234,228,.06)'; c.lineWidth = 1;
    for (let x = 0; x <= VW; x += 60) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, VH); c.stroke(); }
    for (let y = 0; y <= VH; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(VW, y); c.stroke(); }
    const P = pts.map((pt, i) => {
      const p = E.back(seg(t, T.holos + i * .012, T.holos + i * .012 + .32), 1.4);
      return [lerp(CX, pt[0], p), lerp(CY, pt[1], p), p];
    });
    c.strokeStyle = INK; c.lineWidth = 2.2;
    for (const [a, b] of BONES) {
      const bp = seg(t, T.holos + .18 + a * .01, T.holos + .4 + a * .01);
      if (bp <= 0) continue;
      c.globalAlpha = fade * bp * .8;
      c.beginPath(); c.moveTo(P[a][0], P[a][1]); c.lineTo(lerp(P[a][0], P[b][0], E.out3(bp)), lerp(P[a][1], P[b][1], E.out3(bp))); c.stroke();
    }
    c.globalAlpha = fade;
    P.forEach(([x, y], i) => dot(x, y, (i % 4 === 0 && i ? 9 : 6.5) * (i === 0 ? 1.4 : 1), i === 4 || i === 8 ? SIG : INK, i === 4 || i === 8 ? .6 : 0));
    /* Readouts, like the debug overlay on a hand-tracking build. */
    const d = Math.hypot(pts[4][0] - pts[8][0], pts[4][1] - pts[8][1]) / 640;
    const ro = seg(t, T.holos + .3, T.holos + .4);
    mono(`index_tip  ${(pts[8][0] / VW).toFixed(3)}, ${(pts[8][1] / VH).toFixed(3)}`, pts[8][0] + 30, pts[8][1] - 26, { size: 15, color: INK2, alpha: ro, upper: false });
    mono(`thumb_tip  ${(pts[4][0] / VW).toFixed(3)}, ${(pts[4][1] / VH).toFixed(3)}`, pts[4][0] - 360, pts[4][1] + 6, { size: 15, color: INK2, alpha: ro, upper: false });
    mono(d < .03 ? 'pinch ● grab' : `pinch ${d.toFixed(2)}`, HERO.x, 1000, { size: 24, color: d < .03 ? SIG : INK, alpha: ro });
    mono('21 joints · 60 Hz', HERO.x, 1034, { size: 15, color: MUTED, alpha: ro });
    mono('■ Holos · Techstars · 2019–2022', HERO.x, 136, { size: 19, alpha: ro });
    c.restore();
  }
  /* The pinch pulls a window open onto the real training platform. */
  if (t >= T.pinch) {
    const p = E.ioX(seg(t, T.pinch, T.pinch + .42));
    const x = lerp(pinchPt[0], 0, p), y = lerp(pinchPt[1], 0, p), w = lerp(0, VW, p), h = lerp(0, VH, p);
    let clip = 'hol-repair', lt = t - T.pinch + .3, z = 1.04 + (t - T.pinch) * .06, fy = .5;
    if (t >= T.holHands) { clip = 'hol-hands'; lt = t - T.holHands + .4; z = 1.05 + (t - T.holHands) * .05; }
    if (t >= T.hol750) { clip = 'hol-750'; lt = t - T.hol750 + .3; z = 1.03 + (t - T.hol750) * .06; }
    const fo = { zoom: z, fy };
    /* The contract slide quiets down to a soft grey ground for the figure. */
    const quiet = clip === 'hol-750' ? seg(t, T.hol750 + .02, T.count + .1) : 0;
    if (quiet > 0) fo.filter = `grayscale(${quiet}) blur(${(quiet * 16).toFixed(1)}px) brightness(${(1 - quiet * .35).toFixed(2)})`;
    footage(clip, lt, x, y, w, h, fo);
    [T.holHands, T.hol750].forEach((k) => fill('#fff', decay(t, k, 28) * .25));
    if (t < T.hol750) {
      scrim(VH * .52, VH, 0, .88 * p);
      mono('■ Holos · AR/VR training platform', HERO.x, 760, { size: 19, alpha: seg(t, T.pinch + .3, T.pinch + .4) });
      rise([{ t: 'Hands-on XR training.' }], HERO.x - 6, 900, 140, seg(t, T.pinch + .3, T.pinch + .65), { exit: seg(t, T.hol750 - .12, T.hol750) });
      const feats = ['Hand tracking', 'Gestures', 'Multiplayer', '3D model ingestion'];
      feats.forEach((f, i) => mono(f, HERO.x + i * 300, 982, { size: 17, color: INK2, alpha: seg(t, T.pinch + .5 + i * .08, T.pinch + .6 + i * .08) * (1 - seg(t, T.hol750 - .1, T.hol750)) }));
    } else {
      /* The contract: the slide, bracketed, then our own odometer. */
      const b = mapSrc('hol-750', { x: 0, y: 0, w: VW, h: VH }, fo, { x: 100, y: 70, w: 480, h: 560 });
      void b;
      const dk = seg(t, T.hol750 + .02, T.count + .1);
      fill(BG, dk * .35);
      if (dk > 0) odometer(t, dk);
    }
  }
}
/* Rolling digits: up to $750,000.00, then down to $0.00. */
function odoValue(t) {
  if (t < T.roll) return 750000 * E.out3(seg(t, T.count, T.count + .5));
  return 750000 * (1 - E.io3(seg(t, T.roll, T.fake - .05)));
}
function odometer(t, a) {
  const v = odoValue(t), cents = v * 100;
  const speed = Math.abs(odoValue(t + 1 / 60) - v) * 100 * 60; // cents per second
  const digits = String(Math.max(0, Math.floor(cents))).padStart(8, '0'); // 6 dollars + 2 cents
  const size = 170; font(size, DISPLAY); c.letterSpacing = '0px';
  const dw = c.measureText('0').width;
  const glyphs = ['$', 0, 1, 2, ',', 3, 4, 5, '.', 6, 7];
  let total = 0; glyphs.forEach((g) => total += typeof g === 'number' ? dw : c.measureText(g).width);
  let x = CX - total / 2; const y = CY + 70;
  /* Leading zeros stay dim, like an unused odometer wheel. */
  const lead = digits.search(/[1-9]/);
  c.save(); c.globalAlpha = a;
  for (const g of glyphs) {
    if (typeof g !== 'number') { c.fillStyle = INK; c.fillText(g, x, y); x += c.measureText(g).width; continue; }
    const place = 7 - g;                                   // this wheel counts 10^place cents
    const turns = speed / Math.pow(10, place + 1);         // wheel revolutions per second
    const d = (cents / Math.pow(10, place)) % 10, base = Math.floor(d);
    const dim = (lead < 0 || g < lead) && g < 5;
    c.save(); c.beginPath(); c.rect(x - 4, y - size * .82, dw + 8, size * 1.02); c.clip();
    c.fillStyle = dim ? 'rgba(237,234,228,.22)' : INK;
    if (turns > 3) {
      /* Too fast to read: a blurred smear of digits. */
      for (let k = -2; k <= 2; k++) { c.globalAlpha = a * (k ? .18 : .55); c.fillText(String((base + k + 10) % 10), x, y + k * size * .32); }
    } else {
      /* Slow wheels click over at the end of each step. */
      const f = clamp(((d - base) - .7) / .3), e = E.io3(f);
      c.fillText(String(base), x, y - e * size * .95);
      c.fillText(String((base + 1) % 10), x, y + size * .95 - e * size * .95);
    }
    c.restore();
    x += dw;
  }
  c.restore();
  const lbl = t < T.roll ? 'Helped secure · U.S. Air Force contract' : 'Amount charged';
  mono(lbl, CX, CY + 160, { size: 20, align: 'center', color: INK, alpha: a, keep: true });
}

/* -------------------------------------------------- 4 · FAKEHAUL */
const CONFETTI = (() => { const r = rng(7); return Array.from({ length: 140 }, () => ({ a: r() * Math.PI * 2, v: 500 + r() * 1300, s: 6 + r() * 12, spin: (r() - .5) * 18, col: ['#FFFFFF', '#FFD23F', '#16A34A', '#151413', '#FFB4A2'][Math.floor(r() * 5)], w: r() })); })();
function sceneFake(t) {
  const lt = t - T.fake;
  if (t < T.press) {
    /* Sunburst in FakeHaul's own visual language and its own orange. */
    fill(FH);
    c.save(); c.translate(CX, CY); c.rotate(lt * .25);
    c.fillStyle = 'rgba(255,255,255,.07)';
    for (let i = 0; i < 24; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 1400, i / 24 * Math.PI * 2, (i + .5) / 24 * Math.PI * 2); c.closePath(); c.fill(); }
    c.restore();
    /* $0.00 lands huge, then steps aside for the phones. */
    const mv = E.ioX(seg(t, T.fake + .35, T.fake + .75));
    const sz = lerp(400, 230, mv) * lerp(1.18, 1, E.spring(seg(t, T.fake, T.fake + .4)));
    c.save(); font(sz * (mv > .5 ? .62 : .82), DISPLAY, '', 850); c.letterSpacing = '-0.04em'; c.textAlign = mv > .5 ? 'left' : 'center';
    const zx = lerp(CX, HERO.x - 8, mv), zy = lerp(CY + 140, 640, mv);
    c.textAlign = 'left'; const zw = c.measureText('$0.00').width;
    c.fillStyle = '#fff'; c.fillText('$0.00', lerp(zx - zw / 2, zx, mv), zy);
    c.restore();
    mono('Amount charged', lerp(CX - 120, HERO.x, mv), lerp(CY - 170, 400, mv), { size: 20, color: '#fff', keep: true });
    rise([{ t: 'Nothing ships.', fam: DISPLAY, track: '-0.03em' }], HERO.x - 2, 760, 84, seg(t, T.fake + .6, T.fake + .9), { color: '#151413', maxW: 640 });
    mono('■ FakeHaul · 2026', HERO.x, 136, { size: 19, color: '#fff', alpha: seg(t, T.fake + .1, T.fake + .2) });
    mono('Haul everything, pay nothing.', HERO.x, 840, { size: 18, color: '#fff', alpha: seg(t, T.fake + .8, T.fake + .95) });
    /* Confetti from the point the digits hit zero. */
    for (const p of CONFETTI) {
      const dt = lt; if (dt < 0 || dt > 1.4) continue;
      const x = CX + Math.cos(p.a) * p.v * dt * .9, y = CY + 40 + Math.sin(p.a) * p.v * dt * .9 + 900 * dt * dt;
      c.save(); c.translate(x, y); c.rotate(p.spin * dt); c.globalAlpha = 1 - seg(dt, 1, 1.4);
      c.fillStyle = p.col; c.fillRect(-p.s / 2, -p.s * .3, p.s, p.s * .6 * (0.5 + p.w)); c.restore();
    }
    /* Three phones rise in, each a real screen recording. */
    const phones = [['fh-deals', 1010, .2], ['fh-checkout', 1330, .3], ['fh-zero', 1650, 0]];
    phones.forEach(([clip, x, off], i) => {
      const p = E.outX(seg(t, T.fake + .4 + i * .08, T.fake + .95 + i * .08));
      const pw = 300, ph = 533;
      const y = lerp(VH + 80, 270 + (i % 2) * 70, p) - (t - T.fake) * 30 * (i % 2 ? -1 : 1);
      c.save(); c.translate(x, y + ph / 2); c.rotate((i - 1) * .04 * (1 - p * .5)); c.translate(-x, -(y + ph / 2));
      c.fillStyle = '#151413'; c.beginPath(); rr(x - pw / 2 - 10, y - 10, pw + 20, ph + 20, 40); c.fill();
      footage(clip, off + Math.max(0, t - T.fake - .4) * 1.3, x - pw / 2, y, pw, ph, { r: 32 });
      c.restore();
    });
    return;
  }
  /* The press, slammed in on the beat. */
  fill(BG);
  const pp = seg(t, T.press, T.strobe);
  footage('fh-receipt', .2 + (t - T.press) * .9, 1350, 140, 420, 746, { r: 28, zoom: 1.02 });
  c.save(); c.strokeStyle = 'rgba(237,234,228,.15)'; c.lineWidth = 1; c.beginPath(); rr(1350, 140, 420, 746, 28); c.stroke(); c.restore();
  mono('■ Covered by', HERO.x, 250, { size: 19, color: INK, alpha: seg(t, T.press + .02, T.press + .1) });
  const slam = (txt, at, y, size) => {
    const p = seg(t, at, at + .18);
    if (p <= 0) return;
    const s = lerp(1.5, 1, E.outX(p));
    c.save(); c.translate(HERO.x, y); c.scale(s, s); c.globalAlpha = clamp(p * 3);
    font(size, DISPLAY); c.letterSpacing = '-0.035em'; c.fillStyle = INK;
    const tw = c.measureText(UP(txt)).width, k = Math.min(1, 1120 / tw);
    c.scale(k, k); c.fillText(UP(txt), 0, 0); c.restore();
  };
  slam('The New York Times', T.press + .04, 400, 112);
  slam('Fast Company', T.press + .24, 530, 112);
  slam('BBC', T.press + .44, 660, 112);
  /* And the rest, small and fast: the size of the coverage, not the names. */
  const MORE = ['TODAY', 'Digital Trends', 'NPR Planet Money', 'Vice', 'CBC Radio', 'MarketWatch', 'Futurism', 'Newser', 't3n', 'Cybernews', 'Money Talks News', 'The Cool Down', 'Gizbot', 'Oti Simveni'];
  c.save(); font(22, TEXT); c.letterSpacing = '.08em';
  let mx = HERO.x, my = 780;
  MORE.forEach((name, i) => {
    const w = c.measureText(UP(name)).width;
    if (mx + w > HERO.x + 1100) { mx = HERO.x; my += 44; }
    mono(name, mx, my, { size: 22, color: INK2, keep: true, alpha: seg(t, T.press + .62 + i * .034, T.press + .7 + i * .034) });
    mx += w + 34;
  });
  c.restore();
  void pp;
}

/* --------------------------------------------- 6 · FULL STOP */
const STROBE = [['fh-zero', .9], ['hol-750', .5], ['ign-outfit', .6], ['mesh-whale', 1.2], ['fac-gallery', 1], ['av-grid', .8], ['hol-repair', 1.3], ['mesh-space', 2], ['fh-checkout', 1.2], ['fac-recap', 1.5], ['mesh-whale', 2.2], ['hol-pilot', 1], ['av-call', 1], ['fac-ask', 1], ['mesh-garden', 1.2]];
function sceneEnd(t) {
  fill(BG);
  /* Every shot again, one flash each, collapsing into the dot. */
  if (t < T.still) {
    const p = seg(t, T.strobe, T.still);
    const k = Math.min(STROBE.length - 1, Math.floor(p * STROBE.length));
    const s = lerp(1, .0, E.inX(p));
    const w = Math.max(R0 * 2, VW * s), h = Math.max(R0 * 2, VH * s);
    footage(STROBE[k][0], STROBE[k][1], CX - w / 2, CY - h / 2, w, h, { zoom: 1.1 });
    if (k % 3 === 0) fill(SIG, .12);
    if (E.inX(p) > .85) dot(CX, CY, R0, SIG, 1);
    return;
  }
  /* Silence. Just the square, a breath before the headline. */
  const fly = E.ioX(seg(t, T.hero + .25, T.land));
  /* The square arcs across into the headline's final full stop. */
  const dx = lerp(CX, PERIOD.x, fly), dy = lerp(CY, PERIOD.y, fly) - Math.sin(fly * Math.PI) * 220;
  const squash = decay(t, T.land, 14);

  /* The cover, set as it is on jackyang.io. */
  HERO.lines.forEach((ln, i) => {
    rise(ln.parts, HERO.x, ln.base, ln.size, seg(t, T.hero + i * .1, T.hero + .55 + i * .1), { maxW: 1e9 });
  });
  const chrome = seg(t, T.land, T.land + .3);
  if (chrome > 0) {
    dot(HERO.x + 9, 92, 9, SIG, .3 * chrome);
    typed('Software Engineer @ Microsoft Teams AI', HERO.x + 34, 100, seg(t, T.land + .05, T.land + .5), { size: 20, alpha: chrome, weight: 700, keep: true });
  }
  if (t >= T.land) ring(PERIOD.x, PERIOD.y, R0 + E.outX(seg(t, T.land, T.land + .7)) * 320, (1 - seg(t, T.land, T.land + .7)) * .7, 2);
  /* Once landed, the square is the full stop: it settles from red to ink. */
  const settle = seg(t, T.land + .5, T.land + 1.1);
  const r = R0 * (1 + squash * .8 + (t < T.hero ? .25 * Math.sin((t - T.still) * 18) * (1 - seg(t, T.still, T.hero)) : 0));
  c.save(); c.translate(dx, dy);
  c.scale(1 + squash * .5, 1 - squash * .35);
  dot(0, 0, r, settle >= 1 ? INK : SIG, (.55 + squash * 1.2) * (1 - settle));
  if (settle > 0 && settle < 1) { c.globalAlpha = settle; dot(0, 0, r, INK); }
  c.restore();
}

/* ------------------------------------------------------------ HUD */
const CHAPTERS = [[T.strike, '01', 'Turn-taking'], [T.teams, '02', 'Teams AI'], [T.mesh, '03', 'Mesh'], [T.holos, '04', 'Holos'], [T.roll + .5, '05', 'FakeHaul']];
function hud(t) {
  return; // no chapter strip, no timecode: the film runs clean
  // eslint-disable-next-line no-unreachable
  if (t < T.strike + .1 || t > T.strobe) return;
  const a = seg(t, T.strike + .1, T.strike + .3) * (1 - seg(t, T.strobe - .15, T.strobe));
  let k = 0; for (let i = 0; i < CHAPTERS.length; i++) if (t >= CHAPTERS[i][0]) k = i;
  /* Bottom: the gliding line, the site's "you are here". */
  const x0 = HERO.x, x1 = VW - HERO.x, y = 1052;
  c.save(); c.globalAlpha = a;
  c.fillStyle = 'rgba(237,234,228,.18)'; c.fillRect(x0, y, x1 - x0, 1);
  const span = (i) => { const s = CHAPTERS[i][0], e = i + 1 < CHAPTERS.length ? CHAPTERS[i + 1][0] : T.strobe; return [lerp(x0, x1, (s - T.strike) / (T.strobe - T.strike)), lerp(x0, x1, (e - T.strike) / (T.strobe - T.strike))]; };
  CHAPTERS.forEach((ch, i) => { const [s, e] = span(i); mono(`${ch[1]} ${ch[2]}`, s, y - 12, { size: 13, color: i === k ? INK : 'rgba(237,234,228,.4)' }); });
  const [s, e] = span(k);
  const g = E.outX(seg(t, CHAPTERS[k][0], CHAPTERS[k][0] + .35));
  const [ps, pe] = k ? span(k - 1) : [s, e];
  c.fillStyle = INK; c.fillRect(lerp(ps, s, g), y - 1, lerp(pe - ps, e - s, g), 3);
  dot(lerp(x0, x1, (t - T.strike) / (T.strobe - T.strike)), y, 4.5, SIG);
  /* Top right: a running timecode with the live dot. */
  const f = Math.floor(t * 30);
  const tc = `00:00:${String(Math.floor(f / 30)).padStart(2, '0')}:${String(f % 30).padStart(2, '0')}`;
  mono(tc, VW - HERO.x, 136, { size: 19, align: 'right', alpha: t >= T.langs && t < T.ignite ? 0 : 1 });
  c.restore();
}

/* ------------------------------------------------------- compose */
function render(t) {
  c.setTransform(K, 0, 0, K, 0, 0);
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  if (t < T.teams) sceneOpen(t);
  else if (t < T.mesh) sceneTeams(t);
  else if (t < T.holos) sceneMesh(t);
  else if (t < T.fake) {
    if (t < T.roll) sceneHolos(t);
    else { fill(BG); footage('hol-750', t - T.hol750 + .3, 0, 0, VW, VH, { zoom: 1.03 + (t - T.hol750) * .06, alpha: 1 - seg(t, T.roll + .15, T.roll + .45), filter: 'grayscale(1) blur(16px) brightness(.65)' }); fill(BG, .35 + .65 * seg(t, T.roll + .15, T.roll + .45)); odometer(t, 1); }
  }
  else if (t < T.strobe) sceneFake(t);
  else sceneEnd(t);
  hud(t);
  wipes(t);
}

/* The wipe: in over the outgoing shot, out over the incoming one. */
function wipes(t) {
  for (const at of WIPES) {
    const a = seg(t, at - .24, at), b = seg(t, at, at + .26);
    if (a <= 0 || b >= 1) continue;
    const x0 = a < 1 ? -60 : E.io3(b) * (VW + 260), x1 = a < 1 ? E.io3(a) * (VW + 260) : VW + 260;
    c.save();
    c.fillStyle = BG; c.fillRect(x0, 0, x1 - x0 - 200, VH);
    /* The trail: the slab's leading edge burns red and fades behind it. */
    const g = c.createLinearGradient(x1 - 260, 0, x1, 0);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.62, 'rgba(229,41,31,.85)'); g.addColorStop(1, 'rgba(229,41,31,0)');
    c.fillStyle = g; c.fillRect(x1 - 260, 0, 260, VH);
    c.fillStyle = SIG; c.fillRect(x1 - 104, 0, 8, VH);
    c.restore();
  }
}

/* ------------------------------------------------------ post (GL) */
const gl = out.getContext('webgl', { preserveDrawingBuffer: true, antialias: false });
const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0,1);}';
const FS = `precision highp float;varying vec2 v;uniform sampler2D u;uniform vec2 res;uniform float t,ab,gli,grain,vig,warp,flash;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
  vec2 uv=v;
  if(false){float row=floor(uv.y*36.);float fr=floor(t*60.);float r=h(vec2(row,fr));
    if(r<gli*.55)uv.x+=(h(vec2(row,fr+7.))-.5)*.16*gli;
    float blk=step(.92-gli*.2,h(vec2(floor(uv.y*9.),fr+3.)));uv.x+=blk*(h(vec2(fr,2.))-.5)*.05*gli;}
  vec2 c=uv-.5;float d=dot(c,c);uv=.5+c*(1.-warp*d*.9);
  vec2 o=vec2(0.);
  vec3 col=vec3(texture2D(u,uv+o).r,texture2D(u,uv).g,texture2D(u,uv-o).b);
  vec3 b=vec3(0.);float tot=0.;
  for(int i=0;i<12;i++){float a=float(i)*.5236;vec2 q=vec2(cos(a),sin(a))*(6./res);
    vec3 s1=texture2D(u,uv+q*2.).rgb,s2=texture2D(u,uv+q*5.).rgb;b+=max(s1-.62,0.)+max(s2-.62,0.)*.7;tot+=1.7;}
  b*=0.;
  col*=1.-vig*d*1.25;
  
  col=mix(col,vec3(1.,.97,.94),flash);
  gl_FragColor=vec4(col,1.);
}`;
let prog, tex, U = {};
function initGL() {
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog); gl.useProgram(prog);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  for (const n of ['res', 't', 'ab', 'gli', 'grain', 'vig', 'warp', 'flash']) U[n] = gl.getUniformLocation(prog, n);
  gl.viewport(0, 0, W, H);
}
function post(t) {
  let ab = .12, warp = 0, flash = 0, gli = 0;
  for (const i of IMPACTS) { ab += decay(t, i, 9) * 1.1; warp += decay(t, i, 16) * .35; }
  for (const i of [T.strike, T.teams, T.fake, T.land]) flash += decay(t, i, 22) * .3;
  for (const w of WIPES) { ab += Math.exp(-Math.pow((t - w) / .12, 2)) * .9; warp += Math.exp(-Math.pow((t - w) / .12, 2)) * .2; }
  gli += seg(t, T.squeeze + .05, T.mesh) * (1 - seg(t, T.mesh, T.mesh + .08)) * .9;
  gli += (t > T.roll && t < T.fake ? .25 + .5 * seg(t, T.roll, T.fake) : 0);
  gli += t > T.strobe && t < T.still ? .35 + .4 * seg(t, T.strobe, T.still) : 0;
  gli += decay(t, T.cuts, 18) * .5 + decay(t, T.holos, 14) * .4;
  /* The quiet frames at either end stay clean, so the loop is seamless. */
  const calm = t < T.strike || t > T.land + 1.2;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
  gl.uniform2f(U.res, W, H); gl.uniform1f(U.t, t);
  gl.uniform1f(U.ab, calm ? .12 : ab); gl.uniform1f(U.gli, Math.min(1, gli)); gl.uniform1f(U.grain, .055);
  gl.uniform1f(U.vig, .55); gl.uniform1f(U.warp, warp); gl.uniform1f(U.flash, Math.min(.6, flash));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

/* -------------------------------------------------------- driver */
async function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  for (let k = 0; k < 4; k++) {
    need.clear();
    render(t);
    if (!need.size) break;
    await Promise.all([...need].map(load));
  }
  trimCache();
  post(t);
}
function measurePeriod() {
  c.setTransform(1, 0, 0, 1, 0, 0);
  /* Each line stretched to the same 1500px column, as the site's cover does. */
  const COL = 1500, x0 = (VW - COL) / 2;
  const LINES = [[{ t: 'Real-time AI' }], [{ t: 'for ' }, { t: 'real', color: SIG }], [{ t: 'conversations' }]];
  let y = 300;
  HERO.lines = LINES.map((parts, i) => {
    const tail = i === 2 ? '.' : '';
    const w = measure(i === 2 ? [...parts, { t: tail }] : parts, 100);
    const size = 100 * COL / w;
    y += size * .82;
    return { parts, size, base: y };
  });
  HERO.x = x0;
  /* The final period: where it sits, and its half-width is the square's size. */
  const last = HERO.lines[2];
  const wWord = measure(last.parts, last.size);
  font(last.size, DISPLAY); c.letterSpacing = '-0.035em';
  const m = c.measureText('.');
  R0 = (m.actualBoundingBoxRight + m.actualBoundingBoxLeft) / 2;
  PERIOD = { x: x0 + wWord + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2, y: last.base - (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2 };
  c.letterSpacing = '0px';
}
async function boot() {
  CLIPS = await (await fetch('media/clips.json')).json();
  await Promise.all([
    document.fonts.load('850 100px Archivo'), document.fonts.load('600 100px Archivo'),
  ]);
  await document.fonts.ready;
  measurePeriod();
  initGL();
  window.__seek = seek;
  window.__info = () => ({ R0, PERIOD });
  await seek(+(q.get('t') || 0));
  window.__ready = true;

  /* Preview: scrub or play in real time (drops frames while loading). */
  const scrub = document.getElementById('scrub'), tc = document.getElementById('tc');
  let playing = false, t0 = 0, s0 = 0, busy = false;
  scrub.oninput = () => { playing = false; seek(+scrub.value); tc.textContent = (+scrub.value).toFixed(2); };
  document.getElementById('play').onclick = () => { playing = !playing; t0 = performance.now(); s0 = +scrub.value; };
  const tick = async () => {
    if (playing && !busy) {
      busy = true;
      const t = (s0 + (performance.now() - t0) / 1000) % DUR;
      await seek(t); scrub.value = t; tc.textContent = t.toFixed(2);
      busy = false;
    }
    requestAnimationFrame(tick);
  };
  tick();
}
boot().catch((e) => { console.error(e); document.body.insertAdjacentHTML('beforeend', `<pre style="color:#f55">${e.stack}</pre>`); });
})();
