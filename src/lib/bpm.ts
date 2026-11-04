/** Autocorrelation BPM on an onset envelope. hopSec is the sample period. */
export function estimateBpm(
  energy: number[],
  hopSec = 0.05,
): { bpm: number; confidence: number } {
  if (energy.length < 60) return { bpm: 0, confidence: 0 };
  const mean = energy.reduce((a, b) => a + b, 0) / energy.length;
  const x = energy.map((v) => v - mean);
  let power = 0;
  for (const v of x) power += v * v;
  if (power < 1e-8) return { bpm: 0, confidence: 0 };

  const minLag = Math.max(2, Math.round(60 / 180 / hopSec));
  const maxLag = Math.min(x.length - 2, Math.round(60 / 80 / hopSec));
  let best = -Infinity;
  let second = -Infinity;
  let bestLag = minLag;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let acc = 0;
    for (let i = lag; i < x.length; i++) acc += x[i]! * x[i - lag]!;
    const score = acc / (x.length - lag);
    if (score > best) {
      second = best;
      best = score;
      bestLag = lag;
    } else if (score > second) {
      second = score;
    }
  }
  const bpm = Math.round(60 / (bestLag * hopSec));
  const norm = best / (power / x.length);
  const sep = best <= 0 ? 0 : (best - Math.max(0, second)) / best;
  const confidence = Math.max(0, Math.min(1, norm * 0.65 + sep * 0.35));
  return { bpm, confidence };
}
