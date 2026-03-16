import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: quotedItemLabel("is released"),
    subtitleTemplate: "Board game by {publisherLabel}",
  },
  dirPath: import.meta.dir,
  id: "board-games-release-year",
  minScore: 12,
  title: "Board Games By Release Year",
});
