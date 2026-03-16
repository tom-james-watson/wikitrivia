import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: quotedItemLabel("is released"),
    subtitleTemplate: (row) =>
      row.developerLabel
        ? `Game engine by ${row.developerLabel}`
        : "Game engine",
  },
  dirPath: import.meta.dir,
  id: "game-engines-release-year",
  minScore: 10,
  title: "Game Engines By Release Year",
});
