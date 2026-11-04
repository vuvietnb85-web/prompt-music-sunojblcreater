import { createServerFn } from "@tanstack/react-start";

type InBands = {
  sub: number;
  bass: number;
  lowMid: number;
  mid: number;
  presence: number;
  air: number;
};

export type UpgradeInput = {
  kind: "audio" | "video" | "none";
  fileLabel: string;
  durationSec: number;
  bpmEstimate: number;
  confidence: number;
  bands: InBands;
  crestDb: number;
  note: string;
  subAmount: number;
  fluteAmount: number;
  keyName?: string;
  centroidHz?: number;
  flatness?: number;
  rolloffHz?: number;
  pitchHz?: number;
  draft: string;
  tone?: string;
  extras?: string[];
  room?: string;
};

export type UpgradeResult =
  | { ok: true; text: string; client: string }
  | { ok: false; error: string };

function num(v: unknown, fallback = 0) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(-80, Math.min(4000, n));
}

function clip(v: unknown, max: number) {
  if (typeof v !== "string") return "";
  return v.replace(/\s+/g, " ").trim().slice(0, max);
}

const TONES = ["JBL", "BOSE", "TOA", "ONKYO", "YAMAHA"];
const EXTRAS = ["brass", "violin", "metal", "bells", "bau"];
const ROOMS = ["club", "stadium", "wedding", "hall"];

const EXTRA_NAME: Record<string, string> = {
  brass: "large ceremonial brass horn",
  violin: "violin",
  metal: "metal flute",
  bells: "temple bells",
  bau: "dan bau",
};

const ROOM_NAME: Record<string, string> = {
  club: "nightclub",
  stadium: "stadium",
  wedding: "wedding ceremony",
  hall: "concert hall",
};

async function ask(apiKey: string, temperature: number, maxTokens: number, system: string, user: string) {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(16000),
    body: JSON.stringify({
      model: "grok-4.5",
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(String(res.status));
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return (body.choices?.[0]?.message?.content ?? "").replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/g, "").trim();
}

export const upgradePrompt = createServerFn({ method: "POST" })
  .validator((data: UpgradeInput) => data)
  .handler(async ({ data }): Promise<UpgradeResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "AI chưa bật trong môi trường này." };
    }
    const bands = data?.bands ?? {
      sub: 0,
      bass: 0,
      lowMid: 0,
      mid: 0,
      presence: 0,
      air: 0,
    };
    const brief = {
      kind: data?.kind === "video" || data?.kind === "audio" ? data.kind : "none",
      file: clip(data?.fileLabel, 80),
      durationSec: num(data?.durationSec),
      bpmDo: num(data?.bpmEstimate),
      tinCay: num(data?.confidence),
      crestDb: num(data?.crestDb),
      sub: num(bands.sub),
      bass: num(bands.bass),
      lowMid: num(bands.lowMid),
      mid: num(bands.mid),
      presence: num(bands.presence),
      air: num(bands.air),
      mucSub: num(data?.subAmount, 85),
      mucSao: num(data?.fluteAmount, 80),
      key: clip(data?.keyName, 24),
      centroidHz: num(data?.centroidHz),
      flatness: num(data?.flatness),
      rolloffHz: num(data?.rolloffHz),
      pitchHz: num(data?.pitchHz),
      note: clip(data?.note, 160),
      draft: clip(data?.draft, 1400),
      tone: TONES.includes(clip(data?.tone, 12).toUpperCase()) ? clip(data?.tone, 12).toUpperCase() : "JBL",
      extras: Array.isArray(data?.extras) ? data.extras.map((x) => clip(x, 16)).filter((x) => EXTRAS.includes(x)) : [],
      room: ROOMS.includes(clip(data?.room, 16)) ? clip(data?.room, 16) : "club",
    };

    const added =
      brief.extras.length > 0 ? brief.extras.map((id) => EXTRA_NAME[id] ?? id).join(", ") : "none beyond the bamboo flute and sub";
    const customerUser = `Speaker character: ${brief.tone}. Room: ${ROOM_NAME[brief.room] ?? brief.room}. Added instruments: ${added}.\nDraft already written:\n${brief.draft}`;

    try {
      let client = "";
      try {
        client = await ask(
          apiKey,
          0.3,
          180,
          "You are the client who commissioned this track. Do not write a Suno prompt. Write one English paragraph under 80 words telling the composer what must be heard. Demand a high-energy first bar, a piece of at least four minutes, a bright vi von bamboo flute, a tense low pedal, the named speaker character, the named room, and any added instruments. No headings, no Hertz, no file names, no measurement numbers.",
          customerUser,
        );
      } catch {
        client = "";
      }
      const text = await ask(
        apiKey,
        0.4,
        700,
        "You are the composer the client hired. You only emit a Suno Custom Mode prompt.\nStyle:\n<english sentences>\n\nExclude:\n<comma list>\nNothing else. English ASCII. No markdown, no names of people, no theory lecture.\nThe copied prompt must be exactly 995 characters. Put every musical fact in the first 800 characters of Style. Do not pad and do not count out loud. The app trims or pads to 995 after you.\nObey the client direction. Laws:\n- Bright bamboo flute, vi von: breath, slide into the note, one ornamental turn, end vibrato, unequal phrases. Clear, never shrill.\n- Deep tense bass with the chosen speaker only: JBL is punchy and heavy, Bose is smooth and enveloping, TOA throws far like a horn, Onkyo is precise, Yamaha is even. A short dry kick, the low fifth enters late. Do not name a speaker the client did not choose.\n- If the client named added instruments, include each one in playable words: ceremonial brass, violin, metal flute, temple bells, dan bau.\n- Name the room: nightclub, stadium, wedding, or concert hall.\n- Harmony: the given key, or D pentatonic if unknown. One suspension that resolves only at the peak.\n- Open at high energy. The first bar already has the hook, the kick, and the bright flute together.\n- Length of the music: at least four minutes. The line rises by step, a second flute a sixth above brightens the peak, the hook returns, then one breath. Never a drop, riser, or impact.\n- Lock 150 BPM. Never print Hz, centroid, rolloff, flatness, band numbers, LUFS, crest, sidechain, ratios, durations, or file names.\nExclude exactly: EDM, supersaw, harsh highs, muddy low-mids, distorted bass.",
        `Client direction:\n${client || "Keep the draft, and make the chosen speaker, room, and instruments obvious."}\n\nDraft:\n${brief.draft}`,
      );
      if (text.length < 80) return { ok: false, error: "AI trả lời quá ngắn." };
      return { ok: true, text, client: clip(client, 180) };
    } catch (err) {
      const status = err instanceof Error ? err.message : "";
      if (/^\d{3}$/.test(status)) return { ok: false, error: `AI trả lỗi ${status}.` };
      return { ok: false, error: "Không gọi được AI." };
    }
  });
