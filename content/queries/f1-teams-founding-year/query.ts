import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is founded",
    subtitleTemplate: "Formula 1 team",
  },
  dirPath: import.meta.dir,
  id: "f1-teams-founding-year",
  minScore: 10,
  title: "Formula 1 Teams By Founding Year",
});
