import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes prime minister of Spain",
  },
  dirPath: import.meta.dir,
  id: "spanish-prime-ministers-taking-office",
  minScore: 20,
  title: "Spanish Prime Ministers Taking Office",
});
