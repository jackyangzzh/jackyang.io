/* FULL STOP — deterministic frame renderer.
 *
 *   node render.mjs --stills [--marks 0.5,2.1,...]   # review stills in ./stills
 *   node render.mjs                                  # 1920×1080 @ 60 fps master (silent)
 *   node render.mjs --audio score.wav                # master with the score muxed in
 *   node render.mjs --w 3840 --h 2160 --out 4k.mp4   # 4K
 */
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const W = +val('--w', 1920), H = +val('--h', 1080), FPS = +val('--fps', 60), DUR = +val('--dur', 20);
const OUT = path.resolve(__dirname, val('--out', 'out/full-stop-master.mp4'));
const FFMPEG = process.env.FFMPEG_PATH || '/Users/jackyang/.hermes/tools/ffmpeg-9.0.1-darwin-arm64/ffmpeg';
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png' };
function serve(root) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(root, path.normalize(p));
      if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
      fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404).end(); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' }).end(buf);
      });
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

async function main() {
  const { srv, port } = await serve(ROOT);
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: true,
    args: ['--force-color-profile=srgb', '--hide-scrollbars', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', `--window-size=${W},${H}`],
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  page.on('console', (m) => { if (['error', 'warn'].includes(m.type())) console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/_motion/full-stop/film.html?render&w=${W}&h=${H}`, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready === true', { timeout: 60000 });
  const shot = async (t) => { await page.evaluate((tt) => window.__seek(tt), t); return page.screenshot({ type: 'jpeg', quality: 95, clip: { x: 0, y: 0, width: W, height: H } }); };

  if (has('--stills')) {
    const dir = path.join(__dirname, 'stills');
    await fsp.mkdir(dir, { recursive: true });
    const marks = val('--marks', '0.3,0.9,1.2,1.7,2.2,2.45,2.8,3.6,4.2,4.6,5.0,5.3,5.8,6.3,6.9,7.3,7.9,8.8,9.1,9.5,10.0,10.5,11.1,11.6,12.0,12.4,12.9,13.4,14.1,14.6,15.2,16.0,16.5,17.0,17.5,18.2,18.7,19.2,19.6,19.99')
      .split(',').map(Number);
    for (const m of marks) await fsp.writeFile(path.join(dir, `t${m.toFixed(2)}.jpg`), await shot(m));
    console.log(`${marks.length} stills -> ${path.relative(ROOT, dir)}`);
  } else {
    await fsp.mkdir(path.dirname(OUT), { recursive: true });
    const audio = val('--audio', null);
    const args = ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-'];
    if (audio) args.push('-i', path.resolve(__dirname, audio), '-c:a', 'aac', '-b:a', '256k', '-shortest');
    args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', val('--crf', '15'), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT);
    const ff = spawn(FFMPEG, args, { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((res, rej) => ff.on('close', (code) => (code === 0 ? res() : rej(new Error('ffmpeg ' + code)))));
    const total = Math.round(DUR * FPS), t0 = Date.now();
    for (let i = 0; i < total; i++) {
      const buf = await shot(i / FPS);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (i % 60 === 0) process.stdout.write(`\r  ${String(Math.round(i / total * 100)).padStart(3)}%  frame ${i}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await done;
    console.log(`\nwrote ${path.relative(ROOT, OUT)}  ${((await fsp.stat(OUT)).size / 1e6).toFixed(1)} MB`);
  }
  await browser.close(); srv.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
