import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is invented",
    subtitleTemplate: "Invented by {inventorLabel}",
  },
  dirPath: import.meta.dir,
  id: "computing-milestones-year",
  minScore: 10,
  title: "Computing Milestones By Invention Year",
});
