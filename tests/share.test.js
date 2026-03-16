import assert from "node:assert/strict";
import { test } from "node:test";
import { buildShareText, getShareResults } from "../lib/share";

test("daily share text matches the new compact format", () => {
  const shareText = buildShareText({
    dateKey: "2026-03-23",
    difficulty: "easy",
    mode: "daily",
    path: "/daily",
    results: [true, false, true, true, true, false, true, true],
    score: 6,
  });

  assert.equal(
    shareText,
    [
      "Wikitrivia / Daily for Mar 23 2026",
      "",
      "🟩🟥🟩🟩🟩🟥🟩🟩",
      "",
      "Score / 6 / Bronze",
      "",
      "https://wikitrivia.tomjwatson.com/daily",
    ].join("\n"),
  );
});

test("free play share text includes category, difficulty, score, and best", () => {
  const shareText = buildShareText({
    difficulty: "normal",
    highscore: 25,
    mode: "free-play",
    path: "/play/history/wars",
    results: [true, false, true, true, true, false, true, true],
    score: 6,
    selectionRoute: {
      kind: "leaf",
      maxYear: null,
      minYear: null,
      nodeId: "all-history-wars",
    },
  });

  assert.equal(
    shareText,
    [
      "Wikitrivia / Free Play / History / Wars / Normal",
      "",
      "🟩🟥🟩🟩🟩🟥🟩🟩",
      "",
      "Score / 6 / Bronze",
      "Best / 25 / Gold",
      "",
      "https://wikitrivia.tomjwatson.com/play/history/wars",
    ].join("\n"),
  );
});

test("share results follow played order rather than timeline order", () => {
  const results = getShareResults([
    {
      fact: "",
      id: "b",
      image: "",
      deckId: "deck",
      deckThemeHue: 0,
      pageViews: null,
      played: {
        correct: false,
        placementIndex: 2,
        showDate: true,
      },
      qid: "Q2",
      rank: 1,
      subtitle: null,
      title: "B",
      wikipediaSlug: null,
      year: 1900,
    },
    {
      fact: "",
      id: "a",
      image: "",
      deckId: "deck",
      deckThemeHue: 0,
      pageViews: null,
      played: {
        correct: true,
        placementIndex: 0,
        showDate: true,
      },
      qid: "Q1",
      rank: 0,
      subtitle: null,
      title: "A",
      wikipediaSlug: null,
      year: 1800,
    },
    {
      fact: "",
      id: "c",
      image: "",
      deckId: "deck",
      deckThemeHue: 0,
      pageViews: null,
      played: {
        correct: true,
        placementIndex: 1,
        showDate: true,
      },
      qid: "Q3",
      rank: 2,
      subtitle: null,
      title: "C",
      wikipediaSlug: null,
      year: 2000,
    },
  ]);

  assert.deepEqual(results, [true, true, false]);
});
