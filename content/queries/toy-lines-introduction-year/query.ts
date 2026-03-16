import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} debuts",
    subtitleTemplate: (row) =>
      row.manufacturerLabel
        ? `Toy line or franchise from ${row.manufacturerLabel}`
        : "Toy line or franchise",
  },
  dirPath: import.meta.dir,
  id: "toy-lines-introduction-year",
  minScore: 5,
  title: "Toy Lines By Introduction Year",
});
