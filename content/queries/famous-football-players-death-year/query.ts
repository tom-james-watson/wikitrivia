import { defineQuery } from "../../query-definition";
import { personSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    subtitleTemplate: personSubtitle,
    titleTemplate: "{itemLabel} dies",
  },
  dirPath: import.meta.dir,
  id: "famous-football-players-death-year",
  minScore: 51,
  title: "Famous Football Players By Death Year",
});
