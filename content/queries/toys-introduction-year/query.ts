import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} debuts",
    subtitleTemplate: "Toy from {manufacturerLabel}",
  },
  dirPath: import.meta.dir,
  id: "toys-introduction-year",
  minScore: 8,
  title: "Toys By Introduction Year",
});
