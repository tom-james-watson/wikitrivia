import { defineQuery } from "../../query-definition";
import { monarchTakingOfficeTitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: monarchTakingOfficeTitle,
  },
  dirPath: import.meta.dir,
  id: "ethiopian-emperors-taking-office",
  minScore: 10,
  title: "Ethiopian Emperors Taking Office",
});
