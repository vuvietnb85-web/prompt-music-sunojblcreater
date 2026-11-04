import assert from "node:assert/strict";
import test from "node:test";
import { asSunoPrompt, composePrompt, DEFAULT_FACTS, PROMPT_CHARS, toAscii } from "./prompt980.ts";

function assertSuno(text: string) {
  assert.match(text, /^Style:\n/);
  assert.match(text, /\n\nExclude:\n/);
  assert.equal(text, toAscii(text));
  assert.match(text, /\b150\b/);
  assert.match(text, /vi von/);
  assert.match(text, /bright bamboo flute/i);
  assert.match(text, /tense pedal/);
  assert.match(text, /low fifth enters late/);
  assert.match(text, /suspension/);
  assert.match(text, /rises by step/);
  assert.match(text, /sixth above/);
  assert.match(text, /single breath/);
  assert.match(text, /high energy/);
  assert.match(text, /at least four minutes/);
  assert.match(text, /first bar/);
  assert.doesNotMatch(text, /Meyda|YIN|centroid|rolloff|flatness|Clearmountain|sidechain|LUFS|crest|Hz|time-map/i);
  assert.doesNotMatch(text, /Zimmer|Williams|Giacchino|Desplat|quartal|polytonal|neapolitan/i);
  assert.doesNotMatch(text, /[^\x09\x0a\x0d\x20-\x7E]/);
  const style = text.split("\n\nExclude:\n")[0] ?? "";
  assert.ok(style.length > 400, `style too thin: ${style.length}`);
  assert.equal(text.length, PROMPT_CHARS);
}

test("default prompt is a clean Suno style block", () => {
  const text = composePrompt(DEFAULT_FACTS);
  assertSuno(text);
  assert.match(text, /D pentatonic/);
  assert.match(text, /\bJBL\b/);
  assert.match(text, /nightclub/);
  assert.match(text, /Interference sets the line/);
  assert.match(text, /Exclude:\nEDM, supersaw/);
  assert.doesNotMatch(text, /No file|armed/);
});

test("measured source becomes musical direction, not lab numbers", () => {
  const text = composePrompt({
    ...DEFAULT_FACTS,
    kind: "audio",
    fileLabel: "đêm sông.wav",
    durationSec: 186.4,
    bpmEstimate: 96,
    confidence: 0.71,
    bands: { sub: 18, bass: 55, lowMid: 80, mid: 40, presence: 33, air: 12 },
    crestDb: 14.2,
    note: "đậm hơi, ít lời",
    subAmount: 92,
    fluteAmount: 64,
    keyName: "D minor",
    centroidHz: 1480,
    flatness: 0.21,
    rolloffHz: 6400,
    pitchHz: 392,
  });
  assertSuno(text);
  assert.match(text, /D minor/);
  assert.match(text, /G4/);
  assert.match(text, /more breath in the flute/);
  assert.match(text, /little or no sung lyric/);
  assert.match(text, /breathes slowly/);
  assert.match(text, /low end is thin/);
  assert.doesNotMatch(text, /\b(96|392|1480|6400|186|18|80|14)\b/);
  assert.doesNotMatch(text, /đêm|đậm|wav/);
});

test("speaker, room, and added instruments enter the style", () => {
  const text = composePrompt({
    ...DEFAULT_FACTS,
    tone: "BOSE",
    room: "wedding",
    extras: ["brass", "violin", "metal", "bells", "bau"],
  });
  assertSuno(text);
  assert.match(text, /Bose/);
  assert.match(text, /wedding/);
  assert.match(text, /ceremonial brass/);
  assert.match(text, /violin/);
  assert.match(text, /metal flute/);
  assert.match(text, /temple bells/);
  assert.match(text, /dan bau/);
  assert.doesNotMatch(text, /\bJBL\b/);
});

test("asSunoPrompt keeps a clean style and rejects a technical dump", () => {
  const clean = composePrompt(DEFAULT_FACTS);
  assert.equal(asSunoPrompt(clean), clean);
  const dumped = asSunoPrompt(
    "Centroid 1480 Hz. Clearmountain sidechain 4:1. Meyda flatness 0.21. Lock 150 somehow.",
    DEFAULT_FACTS,
  );
  assertSuno(dumped);
  assert.doesNotMatch(dumped, /Centroid|Clearmountain|Meyda/);
});

test("a long or broken draft still exports exactly 995 characters", () => {
  const huge = `Style:\n${"A bright bamboo flute at 150 BPM. ".repeat(80)}\n\nExclude:\nEDM, supersaw`;
  const text = asSunoPrompt(huge, DEFAULT_FACTS);
  assert.equal(text.length, PROMPT_CHARS);
  assert.match(text, /^Style:\n/);
  assert.match(text, /\n\nExclude:\n/);
  const broken = asSunoPrompt("not a prompt", DEFAULT_FACTS);
  assert.equal(broken.length, PROMPT_CHARS);
  assertSuno(broken);
});

test("asSunoPrompt drops a leaked measurement sentence and keeps the rest", () => {
  const raw = [
    "Style:",
    "Northern Vietnamese folk, yearning. A bamboo flute leads with breath and a slide. Locked at 150 BPM in D minor. Centroid 900 Hz from Meyda. The low end stays warm and mono like a JBL cabinet.",
    "",
    "Exclude:",
    "EDM, supersaw",
  ].join("\n");
  const text = asSunoPrompt(raw, DEFAULT_FACTS);
  assert.match(text, /^Style:\n/);
  assert.match(text, /bamboo flute/);
  assert.match(text, /JBL/);
  assert.match(text, /Exclude:\nEDM, supersaw/);
  assert.doesNotMatch(text, /Centroid|Meyda|Hz/);
});
