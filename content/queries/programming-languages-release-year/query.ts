import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is created",
    subtitleTemplate: "Programming or computer language",
  },
  dirPath: import.meta.dir,
  id: "programming-languages-release-year",
  minScore: 25,
  title: "Programming Languages By Release Year",
});
