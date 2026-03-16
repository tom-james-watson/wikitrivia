import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} begins",
    subtitleTemplate: "Historical era",
  },
  dirPath: import.meta.dir,
  id: "historical-eras-start-year",
  minScore: 3,
  title: "Historical Eras By Start Year",
});
