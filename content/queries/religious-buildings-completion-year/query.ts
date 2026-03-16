import { defineQuery } from "../../query-definition";
import { descriptionSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is completed",
    subtitleTemplate: descriptionSubtitle,
  },
  dirPath: import.meta.dir,
  id: "religious-buildings-completion-year",
  minScore: 15,
  title: "Religious Buildings By Completion Year",
});
