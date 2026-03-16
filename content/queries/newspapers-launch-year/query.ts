import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    subtitleTemplate: "Newspaper",
    titleTemplate: quotedItemLabel("launches"),
  },
  dirPath: import.meta.dir,
  id: "newspapers-launch-year",
  title: "Newspapers By Launch Year",
});
