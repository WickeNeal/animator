// =====================================================================
//  PAGES — on top of src/engine.js. One page() per screen: steps S = [{ t, view, spot?, note?, cur?, cap? }]
//  walk the screenshot (FULL → component → feature → button → click). Times are the piece's own (head.html).
//  Replace assets/screen.png and src/boxes.js with real captures (tools/capture-kit.mjs).
// =====================================================================
const APP = 'app.example.com';
{
  const B = BOX['screen.png'];
  const S = [
    { t: 3.0,  view: FULL, cur: [1700, 1100], cap: 'Open your app' },
    { t: 4.25, view: [400, 600, 1.6], spot: B.nav, note: 'The feature lives in Settings', cur: ctr(B.nav), cap: 'Go to Settings' },
    { t: 6.75, view: frameBox(B.feature, 1.08), spot: B.feature, note: 'Say what it does in the screen\'s own words', cur: [1900, 220], cap: 'Here it is' },
    { t: 8.75, view: frameBox(B.button, 2.8), spot: B.button, cur: ctr(B.button), cap: 'Turn it on' },
  ];
  page('home', APP + '/settings', caps(S), () => tour('screen.png', S, [cu.navClick, cu.buttonClick]));
}
{
  const B = BOX['screen.png'], ROW = [B.feature[0], B.feature[1] + B.feature[3] + 20, B.feature[2], 230];
  const S = [
    { t: 11.0, view: FULL, cap: 'It\'s on' },
    { t: 12.0, view: frameBox(ROW, 1.1), spot: ROW, note: 'Walk the details that matter, one at a time', cur: [900, 560], cap: 'The details' },
    { t: 15.0, view: FULL, cur: [1500, 900] },
  ];
  page('detail', APP + '/settings', caps(S), () => {
    tour('screen.png', S);
    if (TT > cu.allow) {   // the payoff: wash the window, a check and a line
      const a = clamp(spring(TT, cu.allow, { k: 160, damp: 0.55 }));
      ctx.save(); clipCR(); ctx.fillStyle = `rgba(255,255,255,${0.92 * a})`; ctx.fillRect(CR.x, CR.y, CR.w, CR.h);
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(CRC[0], CRC[1] - 30, 110 * a, 0, TAU); hair(PAL.edge, 3); ctx.stroke();
      polyPath([[CRC[0] - 45, CRC[1] - 30], [CRC[0] - 10, CRC[1] + 5], [CRC[0] + 50, CRC[1] - 65]], false); hair(PAL.accent, 6); ctx.stroke();
      ctx.font = `400 40px ${SANS}`; ctx.fillStyle = PAL.text; ctx.textAlign = 'center'; ctx.fillText('You\'re all set', CRC[0], CRC[1] + 150);
      ctx.restore();
    }
  });
}

// =====================================================================
//  Opening and ending, full iso. The plinth shows assets/logo.svg if there is one, else the WORDMARK.
// =====================================================================
const WORDMARK = 'Your product', TAGLINE = 'new  ·  the feature', END_TITLE = 'Try the new feature', END_SUB = 'Settings → the feature';
function faceImage(fp, name, u, v, w, h) {
  const img = asset(name); if (!img) return false;
  const p0 = isoP(fp(u, v)), px = isoP(fp(u + w, v)), py = isoP(fp(u, v + h));
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  ctx.save(); ctx.transform((px[0] - p0[0]) / iw, (px[1] - p0[1]) / iw, (py[0] - p0[0]) / ih, (py[1] - p0[1]) / ih, p0[0], p0[1]);
  ctx.drawImage(img, 0, 0, iw, ih); ctx.restore(); return true;
}
const HP = { x: -230, y: -150, w: 460, d: 300 }, HPZ = 16 + 6 + 14;
const PANEL = { x: -200, y: -70, w: 400, ht: 130, t: 16 };
function logoPlinth(t0, botHop, botOpts = {}) {
  const dz = (k) => (1 - spring(TT, t0 + k * 0.08, { k: 160, damp: 0.6 })) * 220;
  isoPlates(HP.x, HP.y, 0, HP.w, HP.d, [{ h: 16, r: 44, dz: dz(0) }, { h: 14, gap: 6, inset: 14, r: 36, dz: dz(1) - dz(0) }]);
  const pz = HPZ + (1 - spring(TT, t0 + 0.25, { k: 130, damp: 0.62 })) * 300;
  if (TT > t0 + 0.2) {
    isoPanelY(PANEL.x, PANEL.y, pz, PANEL.w, PANEL.ht, PANEL.t, { r: 16 });
    const fp = faceOf([PANEL.x, PANEL.y + PANEL.t, pz + PANEL.ht], [1, 0, 0], [0, 0, -1]);
    if (!faceImage(fp, 'logo.svg', 40, 22, 320, 91)) isoText(fp, WORDMARK, 40, 80, 40, { color: PAL.text });
  }
  if (TT > cu.botIn) {
    const bz = HPZ + (1 - spring(TT, cu.botIn + 0.05, { k: 170, damp: 0.5 })) * 260;
    cubeBot(-175, 95, bz, 80, { key: 'hero', hop: botHop, ...botOpts });
  }
}
function titleLines(t0, big, small, y) {
  if (TT <= t0) return;
  DEFER.push(() => {
    const a = clamp(spring(TT, t0, { k: 120, damp: 0.85 }));
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    if (big) { ctx.font = `400 62px ${SANS}`; ctx.fillStyle = PAL.text; ctx.fillText(big, W / 2, y + (1 - a) * 16); }
    ctx.font = `400 ${big ? 30 : 34}px ${ISOMONO}`; ctx.fillStyle = PAL.textD; ctx.fillText(small, W / 2, y + (big ? 60 : 0) + (1 - a) * 16);
    ctx.restore();
  });
}
SCENE.logo = () => { setIso({ ox: 960, oy: 600, u: 1.45 }); logoPlinth(cu.logo, [1.4]); titleLines(0.9, '', TAGLINE, 960); };
SCENE.end = () => { setIso({ ox: 960, oy: 560, u: 1.25 }); logoPlinth(cu.endIn - 1, [cu.title + 0.3], { look: 0.5 }); titleLines(cu.title, END_TITLE, END_SUB, 930); };
