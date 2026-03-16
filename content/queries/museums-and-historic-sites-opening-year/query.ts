import { defineQuery } from "../../query-definition";
import { descriptionSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} opens",
    subtitleTemplate: descriptionSubtitle,
  },
  dirPath: import.meta.dir,
  id: "museums-and-historic-sites-opening-year",
  minScore: 30,
  title: "Museums And Historic Sites By Opening Year",
});
