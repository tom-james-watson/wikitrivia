import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} debuts",
    subtitleTemplate: "Car model by {manufacturerLabel}",
  },
  dirPath: import.meta.dir,
  id: "automobile-models-launch-year",
  minScore: 20,
  title: "Automobile Models By Launch Year",
});
