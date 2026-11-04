import assert from "node:assert/strict";
import test from "node:test";
import { FLOOR, MOMO_E164, MOMO_LOCAL } from "./floor.ts";

test("the floor lists nine live apps and the given MoMo number", () => {
  assert.equal(FLOOR.length, 9);
  assert.equal(MOMO_E164, "+84988960419");
  assert.equal(MOMO_LOCAL, "0988960419");
  for (const app of FLOOR) {
    assert.equal(app.href.startsWith("https://"), true);
    assert.ok(app.functions.length >= 3);
    assert.doesNotMatch(app.purpose, /\b(tuyệt vời|số một|#1)\b/i);
  }
});
