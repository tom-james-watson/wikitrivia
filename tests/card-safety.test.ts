import assert from "node:assert/strict";
import { test } from "node:test";
import { textLooksUnsafeForCards } from "../content/card-safety";

test("card safety rejects reported profane standalone terms", () => {
  assert.equal(textLooksUnsafeForCards("‘Cum Town’ starts"), true);
  assert.equal(textLooksUnsafeForCards("Cumberland Gap is completed"), false);
});

test("card safety rejects narrow adult-content wording variants", () => {
  assert.equal(textLooksUnsafeForCards("Sex advice and comedy podcast"), true);
  assert.equal(
    textLooksUnsafeForCards("depicting the sexually explicit adventures"),
    true,
  );
  assert.equal(
    textLooksUnsafeForCards("houses a display of penises and penile parts"),
    true,
  );
});
