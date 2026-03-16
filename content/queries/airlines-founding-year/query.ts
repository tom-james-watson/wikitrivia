import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is founded",
    subtitleTemplate: "Airline",
  },
  dirPath: import.meta.dir,
  id: "airlines-founding-year",
  minScore: 30,
  title: "Airlines By Founding Year",
});
