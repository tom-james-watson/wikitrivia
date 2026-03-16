import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: quotedItemLabel("is published"),
    subtitleTemplate: "Book by {authorLabel}",
  },
  dirPath: import.meta.dir,
  id: "books-publication-year",
  minScore: 10,
  title: "Books By Publication Year",
});
