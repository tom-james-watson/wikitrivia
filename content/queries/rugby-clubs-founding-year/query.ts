import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is founded",
    subtitleTemplate: "Rugby club",
  },
  dirPath: import.meta.dir,
  id: "rugby-clubs-founding-year",
  minScore: 15,
  title: "Rugby Clubs By Founding Year",
});
