import assert from "node:assert/strict";
import { test } from "node:test";
import { getCurrentUtcDateKey } from "../lib/daily";
import { createSeededRandom } from "../lib/seeded-random";

test("daily date key always uses UTC day boundaries", () => {
  assert.equal(
    getCurrentUtcDateKey(new Date("2026-03-21T23:30:00-07:00")),
    "2026-03-22",
  );
  assert.equal(
    getCurrentUtcDateKey(new Date("2026-03-21T00:30:00+09:00")),
    "2026-03-20",
  );
});

test("seeded daily random stays stable for the same date key", () => {
  const first = createSeededRandom("2026-03-21");
  const second = createSeededRandom("2026-03-21");

  const firstSequence = Array.from({ length: 5 }, () => first());
  const secondSequence = Array.from({ length: 5 }, () => second());

  assert.deepEqual(firstSequence, secondSequence);
});

test("different daily date keys produce different sequences", () => {
  const first = createSeededRandom("2026-03-21");
  const second = createSeededRandom("2026-03-22");

  const firstSequence = Array.from({ length: 3 }, () => first());
  const secondSequence = Array.from({ length: 3 }, () => second());

  assert.notDeepEqual(firstSequence, secondSequence);
});

test("seeded random can resume from a saved internal state", () => {
  const original = createSeededRandom("2026-03-21");

  original();
  original();
  const savedState = original.getState();
  const nextValue = original();

  const resumed = createSeededRandom("2026-03-21", savedState);

  assert.equal(resumed(), nextValue);
});
