import { defineQuery } from "../../query-definition";
import { personSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    subtitleTemplate: personSubtitle,
    titleTemplate: "{itemLabel} dies",
  },
  dirPath: import.meta.dir,
  id: "famous-monarchs-death-year",
  minScore: 76,
  title: "Famous Monarchs By Death Year",
});
