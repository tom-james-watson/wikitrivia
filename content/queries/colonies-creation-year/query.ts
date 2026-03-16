import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is established",
    subtitleTemplate: "Colony",
  },
  dirPath: import.meta.dir,
  id: "colonies-creation-year",
  minScore: 20,
  title: "Colonies By Creation Year",
});
