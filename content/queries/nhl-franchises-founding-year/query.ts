import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is founded",
    subtitleTemplate: "NHL franchise",
  },
  dirPath: import.meta.dir,
  id: "nhl-franchises-founding-year",
  minScore: 10,
  title: "NHL Franchises By Founding Year",
});
