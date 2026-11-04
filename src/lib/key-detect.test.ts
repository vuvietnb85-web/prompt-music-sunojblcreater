import assert from "node:assert/strict";
import test from "node:test";
import { detectKey } from "./key-detect.ts";

test("C major triad chroma reads as C major", () => {
  const chroma = [1, 0, 0, 0, 0.8, 0, 0, 0.7, 0, 0, 0, 0];
  assert.equal(detectKey(chroma), "C major");
});

test("A minor triad chroma reads as A minor", () => {
  const chroma = [0.7, 0, 0, 0, 0.8, 0, 0, 0, 0, 1, 0, 0];
  assert.equal(detectKey(chroma), "A minor");
});

test("silence stays unknown", () => {
  assert.equal(detectKey(new Array(12).fill(0)), "unknown");
});
