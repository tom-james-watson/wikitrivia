import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes president of Mexico",
  },
  dirPath: import.meta.dir,
  id: "mexican-presidents-taking-office",
  minScore: 50,
  title: "Mexican Presidents Taking Office",
});
