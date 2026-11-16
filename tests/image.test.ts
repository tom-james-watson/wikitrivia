import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createWikimediaImageCandidates } from "../lib/image";

describe("createWikimediaImageCandidates", () => {
  test("requests only English Wikipedia for files hosted there", () => {
    assert.deepEqual(
      createWikimediaImageCandidates({
        image: "Lady_Gaga_-_Mayhem.png",
        imageRepo: "enwiki",
      }),
      [
        "https://upload.wikimedia.org/wikipedia/en/thumb/d/db/Lady_Gaga_-_Mayhem.png/250px-Lady_Gaga_-_Mayhem.png",
      ],
    );
  });

  test("requests only Commons for files hosted there", () => {
    assert.deepEqual(
      createWikimediaImageCandidates({
        image: "Mollweide_Paleographic_Map_of_Earth,_170_Ma_(Bajocian_Age).png",
        imageRepo: "commons",
      }),
      [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Mollweide_Paleographic_Map_of_Earth%2C_170_Ma_(Bajocian_Age).png/250px-Mollweide_Paleographic_Map_of_Earth%2C_170_Ma_(Bajocian_Age).png",
      ],
    );
  });

  test("tries both wikis when the host was not recorded", () => {
    assert.deepEqual(
      createWikimediaImageCandidates({ image: "Lady_Gaga_-_Mayhem.png" }),
      [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Lady_Gaga_-_Mayhem.png/250px-Lady_Gaga_-_Mayhem.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/d/db/Lady_Gaga_-_Mayhem.png/250px-Lady_Gaga_-_Mayhem.png",
      ],
    );
  });
});
