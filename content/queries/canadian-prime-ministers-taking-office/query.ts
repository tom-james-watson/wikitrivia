import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes prime minister of Canada",
  },
  dirPath: import.meta.dir,
  id: "canadian-prime-ministers-taking-office",
  minScore: 33,
  title: "Canadian Prime Ministers Taking Office",
});
