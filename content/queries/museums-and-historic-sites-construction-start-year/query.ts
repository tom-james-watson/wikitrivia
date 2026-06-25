import { defineQuery } from "../../query-definition";
import { descriptionSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is built",
    subtitleTemplate: descriptionSubtitle,
  },
  dirPath: import.meta.dir,
  id: "museums-and-historic-sites-construction-start-year",
  minScore: 30,
  title: "Museums And Historic Sites By Construction Start Year",
});
