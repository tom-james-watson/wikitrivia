import { defineQuery } from "../../query-definition";
import { personSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    subtitleTemplate: personSubtitle,
    titleTemplate: "{itemLabel} dies",
  },
  dirPath: import.meta.dir,
  id: "famous-revolutionaries-death-year",
  minScore: 29,
  title: "Famous Revolutionaries By Death Year",
});
