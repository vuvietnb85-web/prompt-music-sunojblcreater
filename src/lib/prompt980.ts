import { quantumMusic, type QuantumInput } from "./quantum-music.ts";

export type Bands = {
  sub: number;
  bass: number;
  lowMid: number;
  mid: number;
  presence: number;
  air: number;
};

export const TONE_IDS = ["JBL", "BOSE", "TOA", "ONKYO", "YAMAHA"] as const;
export type ToneId = (typeof TONE_IDS)[number];
export const EXTRA_IDS = ["brass", "violin", "metal", "bells", "bau"] as const;
export type ExtraId = (typeof EXTRA_IDS)[number];
export const ROOM_IDS = ["club", "stadium", "wedding", "hall"] as const;
export type RoomId = (typeof ROOM_IDS)[number];
export const EXTRA_CHOICES: { id: ExtraId; label: string }[] = [
  { id: "brass", label: "Đại kèn đồng" },
  { id: "violin", label: "Violon" },
  { id: "metal", label: "Sáo kim loại" },
  { id: "bells", label: "Chuông chùa" },
  { id: "bau", label: "Đàn bầu" },
];

export const ROOM_CHOICES: { id: RoomId; label: string }[] = [
  { id: "club", label: "Hộp đêm" },
  { id: "stadium", label: "Sân vận động" },
  { id: "wedding", label: "Lễ cưới" },
  { id: "hall", label: "Nhà hát" },
];

export type PromptFacts = {
  kind: "audio" | "video" | "none";
  fileLabel: string;
  durationSec: number;
  bpmEstimate: number;
  confidence: number;
  bands: Bands;
  crestDb: number;
  note: string;
  subAmount: number;
  fluteAmount: number;
  keyName: string;
  centroidHz: number;
  flatness: number;
  rolloffHz: number;
  pitchHz: number;
  tone: ToneId;
  extras: ExtraId[];
  room: RoomId;
};

export const DEFAULT_FACTS: PromptFacts = {
  kind: "none",
  fileLabel: "",
  durationSec: 0,
  bpmEstimate: 0,
  confidence: 0,
  bands: { sub: 0, bass: 0, lowMid: 0, mid: 0, presence: 0, air: 0 },
  crestDb: 0,
  note: "",
  subAmount: 85,
  fluteAmount: 80,
  keyName: "unknown",
  centroidHz: 0,
  flatness: 0,
  rolloffHz: 0,
  pitchHz: 0,
  tone: "JBL",
  extras: [],
  room: "club",
};

export const PROMPT_CHARS = 995;
const FILL =
  " After the break the hook returns harder, the flute stays bright, and the pedal stays tense until the final breath.";
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const BANNED =
  /\b(centroid|rolloff|flatness|meyda|yin|lufs|crest|sidechain|clearmountain|brauer|scheps|katz|ludwig|time-map|formant|dbtp|metadata|opfs)\b/i;

const DEFAULT_EXCLUDE = ["EDM", "supersaw", "harsh highs", "muddy low-mids", "distorted bass"];

const HINTS: Array<[RegExp, string]> = [
  [/ít lời|không lời|khong loi/i, "mostly instrumental, with little or no sung lyric"],
  [/đậm hơi|nhiều hơi|dam hoi/i, "more breath in the flute"],
  [/buồn|u sầu|u sau/i, "a sad, wistful mood"],
  [/tươi|rộn ràng|vui/i, "a lighter, brighter mood"],
  [/ngân/i, "long sustained flute notes"],
  [/mộc|gần mic/i, "a close, dry wooden sound"],
  [/đêm|sông|dem song/i, "a quiet night-river mood"],
];

export function toAscii(raw: string) {
  return raw.replace(/[^\t\n\r\x20-\x7E]/g, " ");
}

function prettyKey(name: string): string | null {
  const match = toAscii(name)
    .trim()
    .match(/^([A-G])(#|b)?\s+(major|minor|pentatonic|dorian|mixolydian)$/i);
  if (!match) return null;
  return `${match[1].toUpperCase()}${match[2] ?? ""} ${match[3].toLowerCase()}`;
}

function hzToNote(hz: number): string | null {
  if (!Number.isFinite(hz) || hz < 70 || hz > 1800) return null;
  const midi = Math.round(69 + 12 * Math.log2(hz / 440));
  const name = NOTES[((midi % 12) + 12) % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${name}${oct}`;
}

function scrubSentences(text: string) {
  const parts = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/);
  return parts
    .filter((part) => part && !BANNED.test(part) && !/\b\d+(?:\.\d+)?\s*hz\b/i.test(part) && !/\b\d+\s*:\s*\d+\b/.test(part))
    .join(" ");
}

function noteSentence(note: string) {
  const hits = HINTS.filter(([re]) => re.test(note)).map(([, line]) => line);
  if (!hits.length) return "";
  const line = hits.join(", ");
  return `${line.charAt(0).toUpperCase()}${line.slice(1)}.`;
}

function extraExclude(note: string) {
  const extra: string[] = [];
  if (/\bedm\b/i.test(note)) extra.push("EDM");
  if (/supersaw/i.test(note)) extra.push("supersaw");
  return extra;
}

function sourceColor(f: PromptFacts) {
  if (f.kind === "none" && f.durationSec <= 0 && f.pitchHz <= 0) return [];
  const lines: string[] = [];
  const note = hzToNote(f.pitchHz);
  if (note) lines.push(`The flute center sits near ${note}.`);
  if (f.durationSec >= 90) lines.push("The source breathes slowly.");
  if ((f.bands?.sub ?? 0) > 0 && f.bands.sub < 30) lines.push("The low end is thin.");
  if (f.bpmEstimate > 0 && f.bpmEstimate < 130) lines.push("The source sits back, so the hook pushes ahead to the lock.");
  return lines;
}

function balanceLine(sub: number, flute: number) {
  const low = sub >= 70 ? "The sub stays forward." : "The sub stays lighter.";
  const high = flute >= 70 ? "The flute stays forward." : "The flute stays lighter.";
  return `${low} ${high}`;
}

function capSentences(required: string[], optional: string[], max: number) {
  const kept = required.filter(Boolean);
  for (const line of optional) {
    if (!line) continue;
    const next = [...kept, line];
    if (next.join(" ").length <= max) kept.push(line);
  }
  return kept.join(" ");
}

export function formatSuno(style: string, exclude: string) {
  return fit995(style, exclude);
}

export function fit995(style: string, exclude: string) {
  const tail = exclude.replace(/\s+/g, " ").trim() || DEFAULT_EXCLUDE.join(", ");
  const budget = PROMPT_CHARS - (`Style:\n`.length + `\n\nExclude:\n`.length + tail.length);
  let body = toAscii(style).replace(/\s+/g, " ").trim();
  if (budget < 40) {
    const shortTail = DEFAULT_EXCLUDE.join(", ");
    return fit995(style, shortTail);
  }
  if (body.length > budget) {
    body = body.slice(0, budget);
    const sp = body.lastIndexOf(" ");
    if (sp > budget - 48) body = body.slice(0, sp);
  }
  while (body.length < budget) {
    const room = budget - body.length;
    if (room < FILL.length) {
      body = body.padEnd(budget, " ");
      break;
    }
    body += FILL;
  }
  const out = `Style:\n${body}\n\nExclude:\n${tail}`;
  return out.length === PROMPT_CHARS ? out : out.slice(0, PROMPT_CHARS).padEnd(PROMPT_CHARS, " ");
}

function bassLine(tone: ToneId) {
  const brand =
    tone === "BOSE"
      ? "smooth and enveloping, the body of a Bose system"
      : tone === "TOA"
        ? "tight and projected, the far throw of a TOA horn"
        : tone === "ONKYO"
          ? "precise and detailed, the grip of an Onkyo system"
          : tone === "YAMAHA"
            ? "even and musical, the balance of a Yamaha system"
            : "punchy and heavy, the weight of a large JBL cabinet";
  return `A deep mono sub is ${brand}. It holds a tense pedal. A short dry kick marks time, and the low fifth enters late.`;
}

function roomLine(room: RoomId) {
  if (room === "stadium") return "The room is a stadium, wide and far, flute slightly right.";
  if (room === "wedding") return "The room is a wedding, warm and ceremonial, flute slightly right.";
  if (room === "hall") return "The room is a concert hall, clear with a short bloom, flute slightly right.";
  return "The room is a nightclub, close and physical, flute slightly right.";
}

const EXTRA_PHRASE: Record<ExtraId, string> = {
  brass: "ceremonial brass",
  violin: "violin",
  metal: "metal flute",
  bells: "temple bells",
  bau: "dan bau",
};

function ensembleLine(ids: ExtraId[]) {
  const bits = EXTRA_IDS.filter((id) => ids.includes(id)).map((id) => EXTRA_PHRASE[id]);
  if (!bits.length) return "";
  return `The ensemble also carries ${bits.join(", ")}.`;
}

function quantumInput(f: PromptFacts): QuantumInput {
  return {
    subAmount: f.subAmount,
    fluteAmount: f.fluteAmount,
    pitchHz: f.pitchHz,
    centroidHz: f.centroidHz,
    air: f.bands?.air ?? 0,
    note: f.note,
  };
}

function quantumSentence(f: PromptFacts) {
  return quantumMusic(quantumInput(f)).sentence;
}

export function composePrompt(f: PromptFacts): string {
  const key = prettyKey(f.keyName) ?? "D pentatonic";
  const tone = TONE_IDS.includes(f.tone) ? f.tone : "JBL";
  const room = ROOM_IDS.includes(f.room) ? f.room : "club";
  const extras = EXTRA_IDS.filter((id) => f.extras?.includes(id));
  const required = [
    "Cinematic northern Vietnamese folk, yearning, vi von, opening at high energy.",
    "From the first bar the hook, the kick, and the bright flute hit together.",
    "A bright bamboo flute sings clearly: breath, a slide in, one ornamental turn, end vibrato, unequal phrases.",
    bassLine(tone),
    ensembleLine(extras),
    `Locked at 150 BPM in ${key}. One suspension colors the harmony and resolves only at the peak.`,
    "Across at least four minutes the line rises by step, a second flute a sixth above brightens the peak, then one single breath.",
    roomLine(room),
  ];
  const optional = [noteSentence(f.note), ...sourceColor(f), quantumSentence(f), balanceLine(f.subAmount, f.fluteAmount)];
  const exclude = [...DEFAULT_EXCLUDE, ...extraExclude(f.note)];
  const unique = exclude.filter((item, i) => exclude.findIndex((x) => x.toLowerCase() === item.toLowerCase()) === i);
  const tail = unique.join(", ");
  const budget = PROMPT_CHARS - (`Style:\n`.length + `\n\nExclude:\n`.length + tail.length);
  return fit995(capSentences(required, optional, Math.max(80, budget)), tail);
}

export function asSunoPrompt(raw: string, facts: PromptFacts = DEFAULT_FACTS): string {
  const text = toAscii(raw).replace(/```[a-z]*/gi, "").replace(/[*#]/g, "").trim();
  const match = text.match(/Style:\s*([\s\S]*?)\n\s*Exclude:\s*([^\n]+)/i);
  if (!match) return composePrompt(facts);
  const style = scrubSentences(match[1] ?? "");
  const exclude = scrubSentences(match[2] ?? "").replace(/\.$/, "");
  if (style.length < 80 || !/\b150\b/.test(style) || !/flute/i.test(style)) return composePrompt(facts);
  return fit995(lockChoices(lockForm(style), facts), exclude.length > 3 ? exclude : DEFAULT_EXCLUDE.join(", "));
}

const TONE_WORD: Record<ToneId, string> = {
  JBL: "JBL",
  BOSE: "Bose",
  TOA: "TOA",
  ONKYO: "Onkyo",
  YAMAHA: "Yamaha",
};

const ROOM_WORD: Record<RoomId, string> = {
  club: "nightclub",
  stadium: "stadium",
  wedding: "wedding",
  hall: "concert hall",
};

function lockChoices(style: string, f: PromptFacts) {
  let next = style;
  const tone = TONE_IDS.includes(f.tone) ? f.tone : "JBL";
  const room = ROOM_IDS.includes(f.room) ? f.room : "club";
  if (!next.includes(TONE_WORD[tone])) next += ` The low end keeps the ${TONE_WORD[tone]} character.`;
  if (!next.toLowerCase().includes(ROOM_WORD[room])) next += ` ${roomLine(room)}`;
  for (const id of EXTRA_IDS) {
    if (!f.extras?.includes(id)) continue;
    const needle = id === "metal" ? "metal flute" : id === "bells" ? "temple bells" : id === "bau" ? "dan bau" : id === "violin" ? "violin" : "brass";
    if (!next.toLowerCase().includes(needle)) next += ` Keep ${EXTRA_PHRASE[id]}.`;
  }
  if (!next.toLowerCase().includes("interference sets the line")) next += ` ${quantumSentence(f)}`;
  return next;
}

function lockForm(style: string) {
  let next = style.replace(/\s+/g, " ").trim();
  if (!/high energy/i.test(next)) {
    next += " From the first bar the hook, the kick, and the bright flute hit together at high energy.";
  }
  if (!/at least four minutes/i.test(next)) {
    next += " The piece runs at least four minutes and keeps the hook through the final section.";
  }
  return next;
}
