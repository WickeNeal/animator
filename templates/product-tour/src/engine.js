// =====================================================================
//  PRODUCT-TOUR ENGINE (isometric kit). Lifted from an approved 97s feature release video (2026-10-06).
//  A step shot = the stage (hero, fixed bottom-left) + the left column (tag, caption) + the window.
//  Pages are real screenshots walked by tour(): the whole screen, each feature spotlit with a callout,
//  then its button, then the click. Pages crossfade inside the window; the cursor carries over.
//  Needs from the piece: SHOT_LIST, TIMELINE.cues, BOX (src/boxes.js), assets 2160 px wide.
//  Piece code goes in src/scenes.js: page(name, address, caps(S), draw) per screen, SCENE.logo/end.
// =====================================================================
const cu = TIMELINE.cues;
const STAGE = { ox: 300, oy: 800, u: 1 };
const PZ0 = 14 + 5 + 12;
const WIN = { x: 640, y: 110, w: 1200, h: 800, bar: 46 };
const CR = { x: WIN.x, y: WIN.y + WIN.bar, w: WIN.w, h: WIN.h - WIN.bar };
const CRC = [CR.x + CR.w / 2, CR.y + CR.h / 2];
// the hero hops on every cue named *Click
const CLICKS = Object.entries(cu).filter(([k]) => k.endsWith('Click')).map(([, t]) => t);
const CAM = { k: 22, d: 9.4 };    // the camera on the app screens: slow, critically damped (~2s)
const GLIDE = { k: 35, d: 11.8 }; // the cursor there: an unhurried glide (~1.3s)
const PCAM = { k: 36, d: 12 }, PGLIDE = { k: 60, d: 15.5 }; // schematic panels (third-party apps) keep a quicker pace
let IN_PANEL = false;
const XF = 0.75;                  // page crossfade

// ---- the stage: a small plinth and the hero, facing the window
function stage() {
  setIso(STAGE);
  isoPlates(-110, -110, 0, 220, 220, [{ h: 14, r: 30 }, { h: 12, gap: 5, inset: 12, r: 24 }]);
  cubeBot(0, 0, PZ0, 96, { key: 'hero', hop: CLICKS.filter((c) => c < TT + 0.5), faceX: true, look: 0.6 });
}

// ---- the left column: a mono tag and a sans caption; caps = [[t, text], ...], the latest one shows
function wrapLines(str, maxW) {
  const out = []; let line = '';
  for (const w of str.split(' ')) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line); return out;
}
function leftColumn(num, label, caps) {
  let k = 0; for (let j = 0; j < caps.length; j++) if (TT >= caps[j][0] - 1e-6) k = j;
  const [c0, caption] = caps[k], a = k === 0 ? 1 : clamp(spring(TT, c0, { k: 120, damp: 0.95 }));
  DEFER.push(() => {
    ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.font = `400 30px ${ISOMONO}`; ctx.fillStyle = PAL.textD; ctx.fillText(num, 80, 150);
    const w = ctx.measureText(num).width;
    polyPath([[80 + w + 16, 140], [80 + w + 76, 140]], false); hair(PAL.edge); ctx.stroke();
    ctx.fillStyle = PAL.text; ctx.fillText(label, 80 + w + 92, 150);
    ctx.globalAlpha = a; ctx.font = `400 54px ${SANS}`;
    wrapLines(caption, 470).forEach((l, i) => ctx.fillText(l, 80, 250 + i * 66 + (1 - a) * 12));
    ctx.restore();
  });
}

// ---- the window: a hairline slab with a chrome bar and an address in mono
function windowFrame() {
  const P = rrectPts(WIN.x, WIN.y, WIN.w, WIN.h, 18, 6);
  polyPath(thickDrop(P, 12), true); ctx.fillStyle = PAL.face; ctx.fill(); hair(PAL.inner); ctx.stroke();
  polyPath(P, true); ctx.fillStyle = PAL.face; ctx.fill();
}
function windowRim(address) {
  const P = rrectPts(WIN.x, WIN.y, WIN.w, WIN.h, 18, 6);
  ctx.fillStyle = PAL.face; ctx.fillRect(WIN.x + 4, WIN.y + 2, WIN.w - 8, WIN.bar - 2);
  polyPath([[WIN.x, CR.y], [WIN.x + WIN.w, CR.y]], false); hair(PAL.inner); ctx.stroke();
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(WIN.x + 28 + i * 22, WIN.y + WIN.bar / 2, 6, 0, TAU); hair(PAL.inner); ctx.stroke(); }
  ctx.font = `400 22px ${ISOMONO}`; ctx.fillStyle = PAL.textD; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(address, WIN.x + WIN.w / 2, WIN.y + WIN.bar / 2 + 1);
  polyPath(P, true); hair(PAL.edge); ctx.stroke();
}
const clipCR = () => { ctx.beginPath(); ctx.roundRect(CR.x, CR.y, CR.w, CR.h, [0, 0, 18, 18]); ctx.clip(); };

// ---- a real screenshot in the window at { cx, cy, z } (asset px; z = 1 fills the width, z < 1 letterboxes)
function screenView(name, v) {
  const img = asset(name); if (!img) return (x, y) => [x, y];
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const sw = iw / v.z, sh = sw * CR.h / CR.w, k = CR.w / sw;
  const sx = sw >= iw ? (iw - sw) / 2 : clamp(v.cx - sw / 2, 0, iw - sw), sy = sh >= ih ? (ih - sh) / 2 : clamp(v.cy - sh / 2, 0, ih - sh);
  ctx.save(); clipCR();
  ctx.fillStyle = '#f4f2ee'; ctx.fillRect(CR.x, CR.y, CR.w, CR.h);
  ctx.drawImage(img, CR.x - sx * k, CR.y - sy * k, iw * k, ih * k);
  ctx.restore();
  return (x, y) => [CR.x + (x - sx) * k, CR.y + (y - sy) * k];
}
const ctr = (b) => [b[0] + b[2] / 2, b[1] + b[3] / 2];
const unionB = (...bs) => { const x0 = Math.min(...bs.map((b) => b[0])), y0 = Math.min(...bs.map((b) => b[1])); return [x0, y0, Math.max(...bs.map((b) => b[0] + b[2])) - x0, Math.max(...bs.map((b) => b[1] + b[3])) - y0]; };
// the view [cx, cy, z] that frames box b with margin m (2160-wide assets)
function frameBox(b, m = 1.3, zmax = 3) {
  const z = Math.min(2160 / (b[2] * m), 2160 * CR.h / CR.w / (b[3] * m));
  return [...ctr(b), Math.min(zmax, z)];
}
const FULL = [1080, 675, 1];

// ---- the cursor: the one dark accent. keys: [[t, x, y], ...] in the current drawing space; clicks: times.
// It starts where the previous page left it (CUR_START, screen px) and is drawn last, over the crossfade.
let CUR_START = null, CURSOR_Q = null, CURSOR_LAST = null;
function cursor(keys, clicks = []) {
  const m = ctx.getTransform();
  if (CUR_START) { const p = m.inverse().transformPoint({ x: CUR_START[0], y: CUR_START[1] }); keys = [[keys[0][0], p.x, p.y], ...keys]; }
  const x = springTrack(keys.map((r) => [r[0], r[1]]), IN_PANEL ? PGLIDE : GLIDE), y = springTrack(keys.map((r) => [r[0], r[2]]), IN_PANEL ? PGLIDE : GLIDE);
  const s = m.transformPoint({ x, y }); CURSOR_LAST = [s.x, s.y];
  const draw = () => {
    ctx.save(); ctx.setTransform(m);
    const zs = 1 / zoomNow();
    for (const c of clicks) {
      const u = (TT - c) / 0.5;
      if (u > 0 && u < 1) { ctx.beginPath(); ctx.arc(x, y, (14 + 54 * EZ.o3(u)) * zs, 0, TAU); hair(PAL.edge, 2.5 * (1 - u) + 0.5); ctx.stroke(); }
    }
    const press = clicks.some((c) => TT > c - 0.08 && TT < c + 0.15) ? 0.84 : 1;
    ctx.translate(x, y); ctx.scale(press * 1.25 * zs, press * 1.25 * zs);
    polyPath([[0, 0], [0, 34], [9, 26], [15, 40], [21, 37], [15, 24], [27, 24]], true);
    ctx.fillStyle = PAL.accent; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = PAL.face; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
  };
  if (CURSOR_Q) CURSOR_Q.push(draw); else draw();
  return [x, y];
}

// ---- spotlight: the window washes back except the box (screen px), which gets a hairline ring
function spotlight(sb, a) {
  if (a <= 0.01) return;
  const [x, y, w, h] = sb, pad = 10;
  ctx.save(); clipCR();
  ctx.beginPath(); ctx.rect(CR.x, CR.y, CR.w, CR.h); ctx.roundRect(x - pad, y - pad, w + 2 * pad, h + 2 * pad, 16);
  ctx.fillStyle = `rgba(255,255,255,${0.6 * a})`; ctx.fill('evenodd');
  ctx.globalAlpha = a; ctx.beginPath(); ctx.roundRect(x - pad, y - pad, w + 2 * pad, h + 2 * pad, 16); hair(PAL.edge, 3); ctx.stroke();
  ctx.restore();
}

// ---- a callout card beside the spotlit feature (screen px box sb): what it is, in the screen's own words
const CALLOUT = { w: 430, pad: 24, size: 27, lh: 36 };
function callout(sb, text, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.font = `400 ${CALLOUT.size}px ${SANS}`;
  const lines = wrapLines(text, CALLOUT.w - 2 * CALLOUT.pad), h = lines.length * CALLOUT.lh + 2 * CALLOUT.pad - 8;
  const [x, y, w, bh] = sb, gap = 30, m = 24;
  let nx, ny;
  if (x + w + gap + CALLOUT.w < CR.x + CR.w - m) { nx = x + w + gap; ny = y + bh / 2 - h / 2; }
  else if (x - gap - CALLOUT.w > CR.x + m) { nx = x - gap - CALLOUT.w; ny = y + bh / 2 - h / 2; }
  else { nx = clamp(x + w - CALLOUT.w, CR.x + m, CR.x + CR.w - m - CALLOUT.w); ny = y + bh + gap + 10 + h < CR.y + CR.h - m ? y + bh + gap + 10 : y - gap - 10 - h; }
  ny = clamp(ny, CR.y + m, CR.y + CR.h - m - h);
  const rise = (1 - a) * 14;
  ctx.globalAlpha = a; ctx.translate(0, rise);
  const P = rrectPts(nx, ny, CALLOUT.w, h, 14, 5);
  polyPath(thickDrop(P, 8), true); ctx.fillStyle = PAL.face; ctx.fill(); hair(PAL.inner); ctx.stroke();
  polyPath(P, true); ctx.fillStyle = PAL.face; ctx.fill(); hair(PAL.edge, 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(nx + CALLOUT.pad, ny + CALLOUT.pad + 12, 6, 0, TAU); ctx.fillStyle = PAL.accent; ctx.fill();
  ctx.fillStyle = PAL.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  lines.forEach((l, i) => ctx.fillText(l, nx + CALLOUT.pad + 20, ny + CALLOUT.pad + 22 + i * CALLOUT.lh));
  ctx.restore();
}

// ---- the tour of one real screen. steps: { t, view: [cx, cy, z], spot?: box, note?, cur?: [x, y], cap? }; img: name or t => name.
// Returns the current map (asset px -> screen px).
function tour(img, steps, clicks = [], under) {
  let k = 0; for (let j = 0; j < steps.length; j++) if (TT >= steps[j].t - 1e-6) k = j;
  const name = typeof img === 'function' ? img(TT) : img;
  const tk = (j) => steps.map((s) => [s.t, s.view[j]]);
  const map = screenView(name, { cx: springTrack(tk(0), CAM), cy: springTrack(tk(1), CAM), z: springTrack(tk(2), CAM) });
  if (under) under(map);
  const s = steps[k];
  if (s.spot) {
    const [x0, y0] = map(s.spot[0], s.spot[1]), [x1, y1] = map(s.spot[0] + s.spot[2], s.spot[1] + s.spot[3]);
    const next = steps[k + 1], out = next ? EZ.io(clamp((next.t - TT) / 0.6)) : 1, sb = [x0, y0, x1 - x0, y1 - y0];
    spotlight(sb, clamp(spring(TT, s.t + 0.4, { k: 50, damp: 0.95 })) * out);
    if (s.note) callout(sb, s.note, clamp(spring(TT, s.t + 0.7, { k: 50, damp: 0.95 })) * out);
  }
  const ck = steps.filter((st) => st.cur).map((st) => [st.t, ...map(...st.cur)]);
  if (ck.length) cursor(ck, clicks);
  return map;
}
const caps = (steps) => steps.filter((s) => s.cap).map((s) => [s.t, s.cap]);

// ---- typed text laid onto a screenshot field (asset px box), sized with the view
function typeInto(map, str, b, t0, cps) {
  const n = Math.floor(clamp((TT - t0) * cps, 0, str.length)); if (!n) return;
  const [sx, sy] = map(b[0] + 26, b[1] + b[3] / 2), [sx2] = map(b[0] + 126, b[1]), k = (sx2 - sx) / 100;
  ctx.save(); clipCR(); ctx.font = `400 ${30 * k}px ${SANS}`; ctx.fillStyle = '#1f1f23'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText(str.slice(0, n), sx, sy + k * 2);
  if (TT < t0 + str.length / cps + 0.6) { const cx = sx + ctx.measureText(str.slice(0, n)).width + 3 * k; ctx.fillStyle = PAL.accent; ctx.fillRect(cx, sy - 16 * k, 2.5 * k, 34 * k); }
  ctx.restore();
}

// ---- piece overlays drawn above every step shot (e.g. an object the hero carries between pages)
const OVERLAYS = [];

// ---- pages and the step shot: stage + column + window(page), the previous page fading out over the new one
const PAGES = {};   // name -> { addr, caps, draw }
const shotIdx = (name) => SHOT_LIST.findIndex((r) => r[1] === name);
const shotEnd = (i) => (i + 1 < SHOT_LIST.length ? SHOT_LIST[i + 1][0] : DURATION);
const offscreen = (() => { const m = {}; return (k) => { if (!m[k]) { const c = document.createElement('canvas'); c.width = W; c.height = H; m[k] = c; } return m[k]; }; })();
// draws page j at time t into canvas cv (off the main frame); returns where its cursor ended
function renderPageOff(j, t, cv) {
  const saved = { ctx, TT, DEFER, CURSOR_Q, CUR_START, CURSOR_LAST };
  ctx = cv.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  TT = t; DEFER = []; CURSOR_Q = []; CUR_START = cursorStart(j); CURSOR_LAST = null;
  PAGES[SHOT_LIST[j][1]].draw();
  const end = CURSOR_LAST;
  ({ ctx, TT, DEFER, CURSOR_Q, CUR_START, CURSOR_LAST } = saved);
  return end;
}
const END_MEMO = {};
function cursorStart(i) {   // where page i's cursor starts: where page i-1's ended
  if (i < 1 || !PAGES[SHOT_LIST[i - 1][1]]) return null;
  if (!(i in END_MEMO)) END_MEMO[i] = renderPageOff(i - 1, shotEnd(i - 1) - 1 / FPS, offscreen('end'));
  return END_MEMO[i];
}
function stepShot(i) {
  const [t0, name, num, label] = SHOT_LIST[i], pg = PAGES[name], prev = i > 0 && PAGES[SHOT_LIST[i - 1][1]];
  windowFrame();
  CUR_START = cursorStart(i); CURSOR_Q = [];
  pg.draw();
  const u = (TT - t0) / XF;
  if (prev && u < 1) {
    const cv = offscreen('xf'); renderPageOff(i - 1, t0 - 1 / FPS, cv);
    ctx.save(); clipCR(); ctx.globalAlpha = 1 - EZ.io(u); ctx.drawImage(cv, 0, 0); ctx.restore();
  }
  const q = CURSOR_Q; CURSOR_Q = null; CUR_START = null;
  windowRim(TT < t0 + XF / 2 && prev ? prev.addr : pg.addr);
  q.forEach((f) => f());
  stage();
  OVERLAYS.forEach((f) => f());
  leftColumn(num, label, pg.caps);
}
function page(name, addr, caps, draw) { PAGES[name] = { addr, caps, draw }; SCENE[name] = stepShot; }

