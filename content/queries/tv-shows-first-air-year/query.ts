import { defineQuery } from "../../query-definition";
import { descriptionSubtitle, quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: quotedItemLabel("airs for the first time"),
    subtitleTemplate: descriptionSubtitle,
    maxTitleLength: 100,
  },
  dirPath: import.meta.dir,
  id: "tv-shows-first-air-year",
  minScore: 20,
  title: "TV Shows By First Air Year",
});
