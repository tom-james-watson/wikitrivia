import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is established",
    subtitleTemplate: "Historical state",
  },
  dirPath: import.meta.dir,
  id: "historical-countries-creation-year",
  minScore: 25,
  title: "Historical States By Creation Year",
});
