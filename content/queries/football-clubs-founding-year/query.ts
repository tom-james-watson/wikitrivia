import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is founded",
    subtitleTemplate: "Football club",
  },
  dirPath: import.meta.dir,
  id: "football-clubs-founding-year",
  minScore: 30,
  title: "Football Clubs By Founding Year",
});
