import { defineQuery } from "../../query-definition";
import { descriptionSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is completed",
    subtitleTemplate: descriptionSubtitle,
  },
  dirPath: import.meta.dir,
  id: "notable-buildings-and-structures-completion-year",
  minScore: 20,
  title: "Notable Buildings And Structures By Completion Year",
});
