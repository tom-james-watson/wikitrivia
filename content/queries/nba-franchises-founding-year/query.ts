import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is founded",
    subtitleTemplate: "NBA franchise",
  },
  dirPath: import.meta.dir,
  id: "nba-franchises-founding-year",
  minScore: 10,
  title: "NBA Franchises By Founding Year",
});
