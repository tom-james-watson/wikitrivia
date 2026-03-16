import { defineQuery } from "../../query-definition";
import { normalizePlaceLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} opens",
    subtitleTemplate: (row) => {
      const admin = normalizePlaceLabel(row.adminLabel);
      const country = normalizePlaceLabel(row.countryLabel);

      if (admin && country && admin !== country) {
        return `Rail line in ${admin}, ${country}`;
      }

      if (admin) {
        return `Rail line in ${admin}`;
      }

      if (country) {
        return `Rail line in ${country}`;
      }

      return "Rail line";
    },
  },
  dirPath: import.meta.dir,
  id: "rail-lines-opening-year",
  minScore: 10,
  title: "Rail Lines By Opening Year",
});
