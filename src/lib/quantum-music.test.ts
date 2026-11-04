import assert from "node:assert/strict";
import test from "node:test";
import { quantumMusic, quantumProbabilities } from "./quantum-music.ts";

test("quantum amplitudes stay normalized and pick a musical line", () => {
  const input = { subAmount: 85, fluteAmount: 80, pitchHz: 0, centroidHz: 0, air: 0, note: "" };
  const { sum } = quantumProbabilities(input);
  assert.ok(Math.abs(sum - 1) < 1e-9);
  const plan = quantumMusic(input);
  assert.match(plan.sentence, /^Interference sets the line:/);
  assert.match(plan.label, /^Lượng tử chọn /);
  assert.ok(plan.probability > 0.1);
});

test("a brighter, heavier source can move the measured state", () => {
  const calm = quantumMusic({ subAmount: 10, fluteAmount: 10, pitchHz: 120, centroidHz: 400, air: 5, note: "đêm" });
  const bright = quantumMusic({ subAmount: 100, fluteAmount: 100, pitchHz: 880, centroidHz: 5000, air: 80, note: "tươi" });
  assert.notEqual(`${calm.motion}${calm.color}${calm.entry}`, `${bright.motion}${bright.color}${bright.entry}`);
});
