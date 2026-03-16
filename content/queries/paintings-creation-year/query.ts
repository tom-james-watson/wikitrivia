import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: quotedItemLabel("is painted"),
    subtitleTemplate: (row) =>
      row.creatorLabel ? `Painting by ${row.creatorLabel}` : "Painting",
  },
  dirPath: import.meta.dir,
  id: "paintings-creation-year",
  minScore: 5,
  title: "Paintings By Creation Year",
});
