/**
 * YIN pitch (de Cheveigne and Kawahara), short window.
 * Returns Hz, or 0 when the frame is unpitched.
 */
export function yinPitch(samples: Float32Array, sampleRate: number): number {
  const n = samples.length;
  if (n < 64 || sampleRate < 8000) return 0;
  const half = Math.floor(n / 2);
  const d = new Float32Array(half);
  for (let tau = 1; tau < half; tau++) {
    let sum = 0;
    for (let i = 0; i < half; i++) {
      const delta = (samples[i] ?? 0) - (samples[i + tau] ?? 0);
      sum += delta * delta;
    }
    d[tau] = sum;
  }
  const cmnd = new Float32Array(half);
  cmnd[0] = 1;
  let running = 0;
  for (let tau = 1; tau < half; tau++) {
    running += d[tau] ?? 0;
    cmnd[tau] = running > 0 ? ((d[tau] ?? 0) * tau) / running : 1;
  }
  const minTau = Math.max(2, Math.floor(sampleRate / 1800));
  const maxTau = Math.min(half - 2, Math.floor(sampleRate / 70));
  const threshold = 0.18;
  let tau = -1;
  for (let t = minTau; t <= maxTau; t++) {
    if ((cmnd[t] ?? 1) < threshold) {
      tau = t;
      while (tau + 1 <= maxTau && (cmnd[tau + 1] ?? 1) < (cmnd[tau] ?? 1)) tau++;
      break;
    }
  }
  if (tau < 0) return 0;
  const x0 = cmnd[tau - 1] ?? 1;
  const x1 = cmnd[tau] ?? 1;
  const x2 = cmnd[tau + 1] ?? 1;
  const denom = 2 * x1 - x2 - x0;
  const better = Math.abs(denom) > 1e-9 ? tau + (x2 - x0) / (2 * denom) : tau;
  if (better <= 0) return 0;
  return sampleRate / better;
}
