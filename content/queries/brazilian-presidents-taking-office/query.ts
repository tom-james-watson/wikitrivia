import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes president of Brazil",
  },
  dirPath: import.meta.dir,
  id: "brazilian-presidents-taking-office",
  minScore: 50,
  title: "Brazilian Presidents Taking Office",
});
