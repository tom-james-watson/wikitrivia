import { defineQuery } from "../../query-definition";
import { monarchTakingOfficeTitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: monarchTakingOfficeTitle,
  },
  dirPath: import.meta.dir,
  id: "holy-roman-emperors-taking-office",
  minScore: 15,
  title: "Holy Roman Emperors Taking Office",
});
