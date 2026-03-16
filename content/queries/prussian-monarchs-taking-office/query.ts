import { defineQuery } from "../../query-definition";
import { monarchTakingOfficeTitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: monarchTakingOfficeTitle,
  },
  dirPath: import.meta.dir,
  id: "prussian-monarchs-taking-office",
  minScore: 12,
  title: "Prussian Monarchs Taking Office",
});
