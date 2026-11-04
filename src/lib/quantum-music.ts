const N = 8;

export type QuantumPlan = {
  motion: 0 | 1;
  color: 0 | 1;
  entry: 0 | 1;
  sentence: string;
  label: string;
  probability: number;
};

export type QuantumInput = {
  subAmount: number;
  fluteAmount: number;
  pitchHz: number;
  centroidHz: number;
  air: number;
  note: string;
};

const MOTION = ["each step stays clean", "a passing tone leans into the line"];
const COLOR = ["the peak leans on a suspended fourth", "the peak leans on a bright major ninth"];
const ENTRY = ["the second flute answers on the peak", "the second flute answers just before the peak"];
const MOTION_VI = ["bước sạch", "nốt đi qua"];
const COLOR_VI = ["quãng bốn treo", "quãng chín sáng"];
const ENTRY_VI = ["sáo đáp đúng đỉnh", "sáo đáp trước đỉnh"];

function bias(value: number, full = 100) {
  if (!Number.isFinite(value)) return 0;
  const x = Math.max(0, Math.min(1, value / full));
  return x * Math.PI;
}

function notePhase(note: string) {
  let hash = 0;
  for (const ch of note) hash = (hash * 33 + ch.charCodeAt(0)) % 360;
  return (hash / 360) * Math.PI;
}

function hadamard(re: Float64Array, im: Float64Array, q: number) {
  const step = 1 << q;
  const s = Math.SQRT1_2;
  for (let base = 0; base < N; base += step * 2) {
    for (let i = 0; i < step; i++) {
      const a = base + i;
      const b = a + step;
      const ar = re[a] ?? 0;
      const ai = im[a] ?? 0;
      const br = re[b] ?? 0;
      const bi = im[b] ?? 0;
      re[a] = s * (ar + br);
      im[a] = s * (ai + bi);
      re[b] = s * (ar - br);
      im[b] = s * (ai - bi);
    }
  }
}

function ry(re: Float64Array, im: Float64Array, q: number, theta: number) {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  const step = 1 << q;
  for (let base = 0; base < N; base += step * 2) {
    for (let i = 0; i < step; i++) {
      const a = base + i;
      const b = a + step;
      const ar = re[a] ?? 0;
      const ai = im[a] ?? 0;
      const br = re[b] ?? 0;
      const bi = im[b] ?? 0;
      re[a] = c * ar - s * br;
      im[a] = c * ai - s * bi;
      re[b] = s * ar + c * br;
      im[b] = s * ai + c * bi;
    }
  }
}

function phase(re: Float64Array, im: Float64Array, q: number, theta: number) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const bit = 1 << q;
  for (let i = 0; i < N; i++) {
    if ((i & bit) === 0) continue;
    const r = re[i] ?? 0;
    const m = im[i] ?? 0;
    re[i] = r * c - m * s;
    im[i] = r * s + m * c;
  }
}

export function quantumProbabilities(input: QuantumInput) {
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  re[0] = 1;
  ry(re, im, 0, bias(input.fluteAmount));
  ry(re, im, 1, bias(input.pitchHz, 800));
  ry(re, im, 2, bias(input.subAmount));
  hadamard(re, im, 0);
  phase(re, im, 0, bias(input.centroidHz, 4000) + notePhase(input.note));
  hadamard(re, im, 0);
  hadamard(re, im, 1);
  phase(re, im, 1, bias(input.air));
  hadamard(re, im, 1);
  const probs = new Array<number>(N);
  let sum = 0;
  for (let i = 0; i < N; i++) {
    const p = (re[i] ?? 0) ** 2 + (im[i] ?? 0) ** 2;
    probs[i] = p;
    sum += p;
  }
  return { probs, sum };
}

export function quantumMusic(input: QuantumInput): QuantumPlan {
  const { probs } = quantumProbabilities(input);
  let best = 0;
  let bestP = -1;
  for (let i = 0; i < probs.length; i++) {
    const p = probs[i] ?? 0;
    if (p > bestP) {
      bestP = p;
      best = i;
    }
  }
  const motion = (best & 1) as 0 | 1;
  const color = ((best >> 1) & 1) as 0 | 1;
  const entry = ((best >> 2) & 1) as 0 | 1;
  return {
    motion,
    color,
    entry,
    sentence: `Interference sets the line: ${MOTION[motion]}, ${COLOR[color]}, and ${ENTRY[entry]}.`,
    label: `Lượng tử chọn ${MOTION_VI[motion]}, ${COLOR_VI[color]}, ${ENTRY_VI[entry]}.`,
    probability: bestP,
  };
}
