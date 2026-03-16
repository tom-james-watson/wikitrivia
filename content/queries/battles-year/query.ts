import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} takes place",
    subtitleTemplate: (row) =>
      row.warLabel ? `Battle in ${row.warLabel}` : "Battle",
  },
  dirPath: import.meta.dir,
  id: "battles-year",
  minScore: 30,
  title: "Battles By Year",
});
