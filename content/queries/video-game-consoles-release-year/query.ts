import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: quotedItemLabel("launches"),
    subtitleTemplate: "Video game console from {manufacturerLabel}",
  },
  dirPath: import.meta.dir,
  id: "video-game-consoles-release-year",
  minScore: 37,
  title: "Video Game Consoles By Release Year",
});
