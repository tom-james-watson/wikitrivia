import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: quotedItemLabel("is published"),
    subtitleTemplate: "Comic book by {authorLabel}",
  },
  dirPath: import.meta.dir,
  id: "comic-books-publication-year",
  minScore: 50,
  title: "Comic Books By Publication Year",
});
