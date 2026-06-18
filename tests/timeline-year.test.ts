import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTimelineYear } from "../content/timeline-year";

test("parseTimelineYear accepts integer timeline years", () => {
  assert.equal(parseTimelineYear("2016"), 2016);
  assert.equal(parseTimelineYear("-659"), -659);
  assert.equal(parseTimelineYear("0"), 0);
  assert.equal(parseTimelineYear(" 42 "), 42);
});

test("parseTimelineYear rejects blank and non-integer year text", () => {
  assert.equal(parseTimelineYear(""), null);
  assert.equal(parseTimelineYear("   "), null);
  assert.equal(parseTimelineYear("2016-01-01"), null);
  assert.equal(parseTimelineYear("2016.5"), null);
  assert.equal(parseTimelineYear("1e3"), null);
});
