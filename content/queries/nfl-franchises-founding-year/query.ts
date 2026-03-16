import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is founded",
    subtitleTemplate: "NFL franchise",
  },
  dirPath: import.meta.dir,
  id: "nfl-franchises-founding-year",
  minScore: 10,
  title: "NFL Franchises By Founding Year",
});
