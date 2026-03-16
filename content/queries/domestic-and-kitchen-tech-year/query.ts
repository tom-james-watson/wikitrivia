import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is invented",
    subtitleTemplate: "Invented by {inventorLabel}",
  },
  dirPath: import.meta.dir,
  id: "domestic-and-kitchen-tech-year",
  minScore: 8,
  title: "Domestic And Kitchen Tech By Invention Year",
});
