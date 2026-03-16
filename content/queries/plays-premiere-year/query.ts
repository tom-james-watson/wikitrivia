import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: quotedItemLabel("premieres"),
    subtitleTemplate: "Play by {authorLabel}",
  },
  dirPath: import.meta.dir,
  id: "plays-premiere-year",
  minScore: 20,
  title: "Plays By Premiere Year",
});
