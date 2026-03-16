import { defineQuery } from "../../query-definition";
import { monarchTakingOfficeTitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: monarchTakingOfficeTitle,
  },
  dirPath: import.meta.dir,
  id: "moroccan-sultans-taking-office",
  minScore: 15,
  title: "Moroccan Sultans Taking Office",
});
