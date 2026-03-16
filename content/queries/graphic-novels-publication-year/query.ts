import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: quotedItemLabel("is published"),
    subtitleTemplate: "Graphic novel by {authorLabel}",
  },
  dirPath: import.meta.dir,
  id: "graphic-novels-publication-year",
  minScore: 5,
  title: "Graphic Novels By Publication Year",
});
