  // the reel's one score (the parts' own scores are never played). Same helpers as any piece: kit/score-head.js
  const cu = TIMELINE.cues;
  to = 'm';
  pad(0.0, 8.05, ['D3', 'A3', 'Fs4'], 0.035, { type: 'triangle', cut: 900, att: 0.1, rel: 0.2 });
  for (let t = 0; t < 8 - 1e-6; t += BEAT) bass(t, nz(t < 4 ? 'D2' : 'A2'), 0.14);
  to = 's';
  sweep(cu.iris - 0.05, cu.iris + 0.45, 0.012, 600, 3200, 0);   // the iris whoosh
