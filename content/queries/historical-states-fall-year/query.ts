import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} falls",
    subtitleTemplate: "Historical state",
  },
  dirPath: import.meta.dir,
  id: "historical-states-fall-year",
  minScore: 42,
  title: "Historical States And Empires By Fall Year",
});
