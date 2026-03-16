import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} begins",
    subtitleTemplate: "Disease outbreak",
  },
  dirPath: import.meta.dir,
  id: "disease-outbreaks-start-year",
  minScore: 0,
  title: "Disease Outbreaks By Start Year",
});
