import { defineQuery } from "../../query-definition";
import { descriptionSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} enters service",
    subtitleTemplate: descriptionSubtitle,
  },
  dirPath: import.meta.dir,
  id: "combat-vehicle-families-introduction-year",
  minScore: 5,
  title: "Combat Vehicle Families By Introduction Year",
});
