import { defineQuery } from "../../query-definition";
import { personSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    subtitleTemplate: personSubtitle,
    titleTemplate: "{itemLabel} dies",
  },
  dirPath: import.meta.dir,
  id: "famous-religious-leaders-death-year",
  minScore: 21,
  title: "Famous Religious Leaders By Death Year",
});
