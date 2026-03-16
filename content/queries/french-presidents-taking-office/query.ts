import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes president of France",
  },
  dirPath: import.meta.dir,
  id: "french-presidents-taking-office",
  minScore: 0,
  title: "French Presidents Taking Office",
});
