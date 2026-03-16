import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} begins",
    subtitleTemplate: "Archaeological culture",
  },
  dirPath: import.meta.dir,
  id: "archaeological-cultures-start-year",
  minScore: 20,
  title: "Archaeological Cultures By Start Year",
});
