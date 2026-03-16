import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: quotedItemLabel("releases"),
    subtitleTemplate: (row) =>
      row.developerLabel ? `Video game by ${row.developerLabel}` : "Video game",
  },
  dirPath: import.meta.dir,
  id: "video-games-release-year",
  minScore: 10,
  title: "Video Games By Release Year",
});
