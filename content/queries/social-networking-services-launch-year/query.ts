import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    subtitleTemplate: "Social networking service",
    titleTemplate: quotedItemLabel("launches"),
  },
  dirPath: import.meta.dir,
  id: "social-networking-services-launch-year",
  title: "Social Networking Services By Launch Year",
});
