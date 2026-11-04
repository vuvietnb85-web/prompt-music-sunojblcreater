import assert from "node:assert/strict";
import test from "node:test";
import { yinPitch } from "./yin.ts";

function sine(freq: number, sampleRate: number, n = 2048) {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = Math.sin((2 * Math.PI * freq * i) / sampleRate);
  return out;
}

test("YIN finds 440 Hz on a pure tone", () => {
  const hz = yinPitch(sine(440, 44100), 44100);
  assert.ok(Math.abs(hz - 440) < 6, `got ${hz}`);
});

test("YIN finds a bamboo-range 392 Hz", () => {
  const hz = yinPitch(sine(392, 48000), 48000);
  assert.ok(Math.abs(hz - 392) < 6, `got ${hz}`);
});

test("silence is unpitched", () => {
  assert.equal(yinPitch(new Float32Array(2048), 44100), 0);
});
