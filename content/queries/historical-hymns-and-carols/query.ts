import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    subtitleTemplate: "Hymn or carol",
    titleTemplate: quotedItemLabel("dates to"),
  },
  dirPath: import.meta.dir,
  id: "historical-hymns-and-carols",
  title: "Historical Hymns And Carols By Year",
});
