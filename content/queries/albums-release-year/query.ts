import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: quotedItemLabel("is released"),
    subtitleTemplate: (row) => `Album by ${row.artistLabel}`,
  },
  dirPath: import.meta.dir,
  id: "albums-release-year",
  minScore: 5,
  title: "Albums By Release Year",
});
