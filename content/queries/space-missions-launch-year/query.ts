import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} launches",
    subtitleTemplate: (row) =>
      row.operatorLabel ? `Mission by ${row.operatorLabel}` : "Space mission",
  },
  dirPath: import.meta.dir,
  id: "space-missions-launch-year",
  minScore: 8,
  title: "Space Missions By Launch Year",
});
