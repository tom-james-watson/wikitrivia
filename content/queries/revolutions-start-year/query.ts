import { defineQuery } from "../../query-definition";
import { normalizePlaceLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} begins",
    subtitleTemplate: (row) => {
      const location = normalizePlaceLabel(row.countryLabel);
      return location ? `Revolution in ${location}` : "Revolution";
    },
  },
  dirPath: import.meta.dir,
  id: "revolutions-start-year",
  minScore: 12,
  title: "Revolutions By Start Year",
});
