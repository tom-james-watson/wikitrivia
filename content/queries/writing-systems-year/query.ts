import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "Introduction of {itemLabel}",
    subtitleTemplate: "Writing system",
  },
  dirPath: import.meta.dir,
  id: "writing-systems-year",
  minScore: 20,
  title: "Writing Systems By Origin Year",
});
