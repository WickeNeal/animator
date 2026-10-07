// =====================================================================
//  kit/reel.js — the renderer for a REEL: one video made of several part pieces, each in its own style.
//
//  Kits can't share a page (they reuse names: STYLE, handText, …), so every part is a whole built piece
//  living in its own hidden iframe (srcdoc: same origin, its own globals). The reel asks the part for a frame
//  at the reel's own time t (parts share the reel's clock: same DURATION, cues in reel seconds) and copies it.
//
//  The reel head defines:
//    REEL = [[t0, 'part', link?], ...]   which part is on screen from t0; link = how this shot comes in:
//        absent / 'cut'                  a hard cut (listed in TIMELINE.cuts)
//        { iris: [x, y], d: 0.5, r0: 60 } the new part opens as a circle growing out of (x, y) over d seconds
//                                        while the old part keeps playing under it (listed in TIMELINE.morphs)
//  tools/build.mjs injects REEL_SRC = { part: '<built index.html>' } from piece.json "reel": { "parts": { … } }.
//  window.renderFrame appears once every part has loaded, so every tool works on a reel unchanged.
// =====================================================================
const PARTS = {};
let REEL_ACTIVE = null;
const REEL_CV = [0, 1].map(() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; });
const REEL_SHOTS = REEL.map(([t0, part, link], i) => ({ i, t0, t1: i + 1 < REEL.length ? REEL[i + 1][0] : DURATION, part, link: link || 'cut' }));
// the iris windows, in the morph renderer's shape, so textcheck skips them like any bridge
const BRIDGES = REEL_SHOTS.filter((s) => s.link.iris).map((s) => ({ tc: s.t0 + (s.link.d ?? 0.5) / 2, d: (s.link.d ?? 0.5) / 2 }));
function shotAtFrame(fr) {
  for (const s of TIMELINE.shots) if (fr >= Math.round(s.t0 * FPS) && fr < Math.round(s.t1 * FPS)) return s;
  return TIMELINE.shots[TIMELINE.shots.length - 1];
}
function reelShotAt(fr) {
  let k = 0; for (let i = 0; i < REEL_SHOTS.length; i++) if (fr >= Math.round(REEL_SHOTS[i].t0 * FPS)) k = i;
  return REEL_SHOTS[k];
}
function reelPart(name, t, cv, sub) {
  const w = PARTS[name]; if (!w) throw new Error(`reel: no part "${name}" (piece.json reel.parts)`);
  w.renderFrame(t, cv, sub); REEL_ACTIVE = w;
  return cv;
}
function reelRender(t, canvas, sub) {
  const cv = canvas || document.getElementById('c'), g = cv.getContext('2d');
  F = ((Math.floor(sub ? t * FPS + 1e-6 : Math.round(t * FPS)) % NFRAMES) + NFRAMES) % NFRAMES;
  B = Math.floor(F / 2); TT = B * 2 / FPS;
  const s = reelShotAt(F), L = s.link;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  if (L.iris && s.i > 0 && TT < s.t0 + (L.d ?? 0.5)) {
    // iris: the old part plays on under a circle of the new one; the radius grows on 2s like everything else
    const [x, y] = L.iris, u = EZ.i2(seg(TT, s.t0, s.t0 + (L.d ?? 0.5)));
    const far = Math.max(...[[0, 0], [W, 0], [0, H], [W, H]].map(([a, b]) => Math.hypot(a - x, b - y)));
    const r = lerp(L.r0 ?? 60, far + 20, u);
    g.drawImage(reelPart(REEL_SHOTS[s.i - 1].part, t, REEL_CV[1], sub), 0, 0);
    reelPart(s.part, t, REEL_CV[0], sub);
    g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); g.drawImage(REEL_CV[0], 0, 0); g.restore();
    g.lineWidth = 10; g.strokeStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.arc(x, y, r + 3, 0, TAU); g.stroke();
  } else {
    g.drawImage(reelPart(s.part, t, REEL_CV[0], sub), 0, 0);
  }
  g.restore();
  return shotAtFrame(F).id;
}
window.anchorAt = (t) => (REEL_ACTIVE && REEL_ACTIVE.anchorAt ? REEL_ACTIVE.anchorAt(t) : null);
// load every part into its own hidden iframe; renderFrame exists only once they all can draw
window.REEL_READY = Promise.all(Object.entries(REEL_SRC).map(([name, html]) => new Promise((ok, fail) => {
  const f = document.createElement('iframe');
  f.style.cssText = 'position:absolute;left:-20000px;top:0;width:' + W + 'px;height:' + H + 'px;border:0;visibility:hidden';
  f.srcdoc = html;
  f.onload = () => {
    const w = f.contentWindow, t0 = performance.now();
    // the part's own morph bridges join the reel's, so textcheck skips those windows too (BRIDGES is a script const: eval reads it)
    const wait = () => (typeof w.renderFrame === 'function' ? (PARTS[name] = w, BRIDGES.push(...w.eval('typeof BRIDGES === "undefined" ? [] : BRIDGES')), ok()) : performance.now() - t0 > 30000 ? fail(new Error('reel: part ' + name + ' never defined renderFrame')) : setTimeout(wait, 20));
    wait();
  };
  document.body.appendChild(f);
}))).then(() => { window.renderFrame = reelRender; });
