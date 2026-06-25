import { defineQuery } from "../../query-definition";
import { descriptionSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is built",
    subtitleTemplate: descriptionSubtitle,
  },
  dirPath: import.meta.dir,
  id: "notable-buildings-and-structures-construction-start-year",
  minScore: 20,
  title: "Notable Buildings And Structures By Construction Start Year",
});
