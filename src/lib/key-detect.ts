const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

const MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

function correlate(chroma: number[], profile: number[], rotation: number) {
  let meanA = 0;
  let meanB = 0;
  for (let i = 0; i < 12; i++) {
    meanA += chroma[(i + rotation) % 12] ?? 0;
    meanB += profile[i] ?? 0;
  }
  meanA /= 12;
  meanB /= 12;
  let sum = 0;
  let sa = 0;
  let sb = 0;
  for (let i = 0; i < 12; i++) {
    const da = (chroma[(i + rotation) % 12] ?? 0) - meanA;
    const db = (profile[i] ?? 0) - meanB;
    sum += da * db;
    sa += da * da;
    sb += db * db;
  }
  return sum / (Math.sqrt(sa * sb) + 1e-9);
}

/** Krumhansl-Schmuckler key from a 12-bin chroma vector. */
export function detectKey(chroma: number[]): string {
  const energy = chroma.reduce((a, b) => a + b, 0);
  if (energy < 0.04) return "unknown";
  let best = 0.2;
  let name = "unknown";
  for (let rot = 0; rot < 12; rot++) {
    const major = correlate(chroma, MAJOR, rot);
    const minor = correlate(chroma, MINOR, rot);
    if (major > best) {
      best = major;
      name = `${NAMES[rot]} major`;
    }
    if (minor > best) {
      best = minor;
      name = `${NAMES[rot]} minor`;
    }
  }
  return name;
}
