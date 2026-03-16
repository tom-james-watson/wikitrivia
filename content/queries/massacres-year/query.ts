import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} takes place",
    subtitleTemplate: "{partOfLabel}",
  },
  dirPath: import.meta.dir,
  id: "massacres-year",
  minScore: 20,
  title: "Massacres By Year",
});
