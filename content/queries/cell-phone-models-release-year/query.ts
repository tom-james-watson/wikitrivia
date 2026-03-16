import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} debuts",
    subtitleTemplate: "Cell Phone",
  },
  dirPath: import.meta.dir,
  id: "cell-phone-models-release-year",
  minScore: 20,
  title: "Cell Phone Models By Release Year",
});
