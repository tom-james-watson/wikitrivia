import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is proclaimed",
    subtitleTemplate: "Declaration of independence",
  },
  dirPath: import.meta.dir,
  id: "declarations-of-independence-year",
  minScore: 12,
  title: "Declarations Of Independence By Year",
});
