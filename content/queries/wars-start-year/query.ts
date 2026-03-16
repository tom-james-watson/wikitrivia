import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} begins",
    subtitleTemplate: "Conflict",
  },
  dirPath: import.meta.dir,
  id: "wars-start-year",
  minScore: 22,
  title: "Wars By Start Year",
});
