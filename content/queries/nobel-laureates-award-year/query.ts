import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} wins the {awardLabel}",
    subtitleTemplate: null,
  },
  dirPath: import.meta.dir,
  id: "nobel-laureates-award-year",
  minScore: 120,
  title: "Nobel Laureates By Award Year",
});
