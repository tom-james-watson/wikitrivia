import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: quotedItemLabel("is released"),
    subtitleTemplate: (row) =>
      row.directorLabel ? `Film directed by ${row.directorLabel}` : "Film",
  },
  dirPath: import.meta.dir,
  id: "films-release-year",
  minScore: 10,
  title: "Films By Release Year",
});
