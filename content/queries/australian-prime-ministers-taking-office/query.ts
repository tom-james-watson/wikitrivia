import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes prime minister of Australia",
  },
  dirPath: import.meta.dir,
  id: "australian-prime-ministers-taking-office",
  minScore: 31,
  title: "Australian Prime Ministers Taking Office",
});
