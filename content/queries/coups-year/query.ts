import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} takes place",
    subtitleTemplate: "Coup d'etat",
  },
  dirPath: import.meta.dir,
  id: "coups-year",
  minScore: 15,
  title: "Coups By Year",
});
