import { defineQuery } from "../../query-definition";
import { descriptionSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is completed",
    subtitleTemplate: descriptionSubtitle,
  },
  dirPath: import.meta.dir,
  id: "bridges-towers-and-skyscrapers-completion-year",
  minScore: 10,
  title: "Bridges Towers And Skyscrapers By Completion Year",
});
