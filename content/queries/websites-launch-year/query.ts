import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    subtitleTemplate: "Website",
    titleTemplate: quotedItemLabel("launches"),
  },
  dirPath: import.meta.dir,
  id: "websites-launch-year",
  title: "Websites By Launch Year",
});
