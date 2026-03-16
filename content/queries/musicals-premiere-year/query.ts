import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: quotedItemLabel("premieres"),
    subtitleTemplate: "Musical by {authorLabel}",
  },
  dirPath: import.meta.dir,
  id: "musicals-premiere-year",
  minScore: 20,
  title: "Musicals By Premiere Year",
});
