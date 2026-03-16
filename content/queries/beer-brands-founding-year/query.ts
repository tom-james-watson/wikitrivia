import { defineQuery } from "../../query-definition";
import { descriptionSubtitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} launches",
    subtitleTemplate: descriptionSubtitle,
  },
  dirPath: import.meta.dir,
  id: "beer-brands-founding-year",
  minScore: 5,
  title: "Beer Brands By Founding Year",
});
