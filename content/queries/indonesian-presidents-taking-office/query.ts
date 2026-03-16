import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes president of Indonesia",
  },
  dirPath: import.meta.dir,
  id: "indonesian-presidents-taking-office",
  minScore: 0,
  title: "Indonesian Presidents Taking Office",
});
