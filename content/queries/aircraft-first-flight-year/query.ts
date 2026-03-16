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
  id: "aircraft-first-flight-year",
  minScore: 3,
  title: "Aircraft By First Flight Year",
});
