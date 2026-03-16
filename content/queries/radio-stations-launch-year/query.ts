import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    subtitleTemplate: "Radio station",
    titleTemplate: quotedItemLabel("launches"),
  },
  dirPath: import.meta.dir,
  id: "radio-stations-launch-year",
  title: "Radio Stations By Launch Year",
});
