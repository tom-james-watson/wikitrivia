import { defineQuery } from "../../query-definition";
import { descriptionSubtitle, quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    subtitleTemplate: descriptionSubtitle,
    titleTemplate: quotedItemLabel("begins"),
  },
  dirPath: import.meta.dir,
  id: "comic-book-series-start-year",
  minScore: 25,
  title: "Comic Book Series By Start Year",
});
