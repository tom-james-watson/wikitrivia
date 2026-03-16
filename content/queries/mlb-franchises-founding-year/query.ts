import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is founded",
    subtitleTemplate: "MLB franchise",
  },
  dirPath: import.meta.dir,
  id: "mlb-franchises-founding-year",
  minScore: 10,
  title: "MLB Franchises By Founding Year",
});
