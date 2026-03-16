import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes president of Russia",
  },
  dirPath: import.meta.dir,
  id: "russian-presidents-taking-office",
  minScore: 158,
  title: "Russian Presidents Taking Office",
});
