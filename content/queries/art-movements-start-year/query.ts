import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} movement begins",
    subtitleTemplate: "Art movement",
  },
  dirPath: import.meta.dir,
  id: "art-movements-start-year",
  minScore: 40,
  title: "Art Movements By Start Year",
});
