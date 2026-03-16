import { defineQuery } from "../../query-definition";
import { descriptionSubtitle, quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: quotedItemLabel("starts"),
    subtitleTemplate: descriptionSubtitle,
    maxTitleLength: 100,
  },
  dirPath: import.meta.dir,
  id: "podcasts-start-year",
  minScore: 1,
  title: "Podcasts By Start Year",
});
