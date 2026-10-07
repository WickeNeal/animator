  // SCORE BODY — product tour template (inside buildScore(); see kit/score-head.js). D major, 120 BPM.
  // Thin open → a calm groove under the tour → thins → a 1s hush → the loudest hit on the payoff → decay.
  const T = TIMELINE, q = T.cues, TOUR0 = 3.0, TOUR1 = q.hush;
  to = 'm';
  pad(0.0, TOUR0 + 0.05, ['D3', 'A3', 'E4'], 0.024, { type: 'triangle', cut: 1300, att: 0.4, rel: 0.3, send: 0.5 });
  pluck(q.logo + 0.2, nz('D4'), 0.14, -0.1, 0.6, 2200, 0.4);
  pluck(q.logo + 0.45, nz('A4'), 0.14, 0.1, 0.6, 2200, 0.4);
  const CHORDS = [['D3', 'A3', 'Fs4'], ['B2', 'Fs3', 'D4'], ['G2', 'D3', 'B3'], ['A2', 'E3', 'Cs4']], ROOT = ['D2', 'B1', 'G1', 'A1'];
  for (let bar0 = TOUR0, n = 0; bar0 < TOUR1 - 1e-6; bar0 += 4 * BEAT, n++) {
    const c = n % 4, end = Math.min(bar0 + 4 * BEAT, TOUR1);
    pad(bar0, end + 0.05, CHORDS[c], 0.02, { type: 'triangle', cut: 1100, att: 0.3, rel: 0.2, send: 0.4 });
    for (let b = bar0; b < end - 1e-6; b += BEAT) bass(b, nz(ROOT[c]), 0.13);
  }
  for (let b = TOUR0; b < TOUR1 - 1 - 1e-6; b += E8) noiseHit(b, 0.04, 'highpass', 7000, 0.8, (Math.round(b / E8) % 2 ? 0.012 : 0.02), 0.2);
  T.cuts.filter((c) => c >= TOUR0 && c < TOUR1).forEach((c, i) => pluck(c, nz(['D', 'Fs', 'A', 'B'][i % 4] + '4'), 0.12, (i % 2 ? 0.2 : -0.2), 0.5, 2400, 0.4));
  // the payoff after the hush: a stab and a sub, then a warm chord
  chime(q.allow, [nz('D5'), nz('Fs5'), nz('A5'), nz('D6')], 0.2); sub(q.allow, 0.9);
  pluck(q.allow, nz('D4'), 0.3, 0, 0.4, 4000, 0.3); noiseHit(q.allow, 0.25, 'lowpass', 2400, 0.7, 0.3, 0, 0.3);
  pad(q.allow + 0.05, q.endIn + 0.05, ['D3', 'A3', 'D4', 'Fs4'], 0.045, { cut: 1500, att: 0.4, rel: 0.3, send: 0.5 });
  // goodbye: the opening fifth comes back and decays
  pad(q.endIn, DURATION, ['D3', 'A3', 'E4'], 0.012, { type: 'triangle', cut: 1300, att: 0.3, rel: 1.2, send: 0.6 });
  chime(q.title, [nz('A5'), nz('D6')], 0.035);
  to = 's';
  Object.entries(q).filter(([k]) => k.endsWith('Click')).forEach(([, c]) => blip(c, 1800, 1200, 0.03, 0.05));
