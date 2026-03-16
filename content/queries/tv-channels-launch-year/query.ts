import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    subtitleTemplate: "TV channel",
    titleTemplate: quotedItemLabel("launches"),
  },
  dirPath: import.meta.dir,
  id: "tv-channels-launch-year",
  title: "TV Channels By Launch Year",
});
