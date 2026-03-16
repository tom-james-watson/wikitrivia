import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} begins",
    subtitleTemplate: "Dynasty",
  },
  dirPath: import.meta.dir,
  id: "dynasties-creation-year",
  minScore: 20,
  title: "Dynasties By Creation Year",
});
