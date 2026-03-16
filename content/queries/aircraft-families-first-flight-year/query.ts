import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} first flies",
    subtitleTemplate: (row) =>
      row.manufacturerLabel
        ? `Aircraft by ${row.manufacturerLabel}`
        : "Aircraft",
  },
  dirPath: import.meta.dir,
  id: "aircraft-families-first-flight-year",
  minScore: 25,
  title: "Aircraft Families By First Flight Year",
});
