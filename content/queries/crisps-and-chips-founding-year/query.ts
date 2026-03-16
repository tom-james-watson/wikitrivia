import { defineQuery } from "../../query-definition";
import { descriptionSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} launches",
    subtitleTemplate: descriptionSubtitle,
  },
  dirPath: import.meta.dir,
  id: "crisps-and-chips-founding-year",
  minScore: 5,
  title: "Crisps And Chips By Founding Year",
});
