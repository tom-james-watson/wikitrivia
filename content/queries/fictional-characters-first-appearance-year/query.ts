import { defineQuery } from "../../query-definition";
import { descriptionSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} first appears",
    subtitleTemplate: descriptionSubtitle,
  },
  dirPath: import.meta.dir,
  id: "fictional-characters-first-appearance-year",
  minScore: 30,
  title: "Fictional Characters By First Appearance Year",
});
