import { defineQuery } from "../../query-definition";
import { descriptionSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is built",
    subtitleTemplate: descriptionSubtitle,
  },
  dirPath: import.meta.dir,
  id: "bridges-towers-and-skyscrapers-construction-start-year",
  minScore: 10,
  title: "Bridges Towers And Skyscrapers By Construction Start Year",
});
