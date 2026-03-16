import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} opens",
    subtitleTemplate: "Sports stadium",
  },
  dirPath: import.meta.dir,
  id: "stadiums-opening-year",
  minScore: 40,
  title: "Stadiums By Opening Year",
});
