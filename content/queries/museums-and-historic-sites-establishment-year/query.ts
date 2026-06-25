import { defineQuery } from "../../query-definition";
import { descriptionSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is established",
    subtitleTemplate: descriptionSubtitle,
  },
  dirPath: import.meta.dir,
  id: "museums-and-historic-sites-establishment-year",
  minScore: 30,
  title: "Museums And Historic Sites By Establishment Year",
});
