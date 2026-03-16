import { defineQuery } from "../../query-definition";
import { monarchTakingOfficeTitle } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    titleTemplate: monarchTakingOfficeTitle,
  },
  dirPath: import.meta.dir,
  id: "bavaria-kings-taking-office",
  title: "Bavaria Kings Taking Office",
});
