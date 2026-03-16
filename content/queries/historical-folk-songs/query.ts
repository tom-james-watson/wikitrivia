import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    subtitleTemplate: "Folk song",
    titleTemplate: quotedItemLabel("dates to"),
  },
  dirPath: import.meta.dir,
  id: "historical-folk-songs",
  title: "Historical Folk Songs By Year",
});
