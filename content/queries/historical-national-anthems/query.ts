import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    subtitleTemplate: "National anthem",
    titleTemplate: quotedItemLabel("dates to"),
  },
  dirPath: import.meta.dir,
  id: "historical-national-anthems",
  title: "Historical National Anthems By Year",
});
