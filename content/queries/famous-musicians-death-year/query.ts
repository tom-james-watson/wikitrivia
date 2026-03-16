import { defineQuery } from "../../query-definition";
import { personSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    subtitleTemplate: personSubtitle,
    titleTemplate: "{itemLabel} dies",
  },
  dirPath: import.meta.dir,
  id: "famous-musicians-death-year",
  minScore: 51,
  title: "Famous Musicians By Death Year",
});
