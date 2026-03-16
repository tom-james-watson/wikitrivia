import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes prime minister of the United Kingdom",
  },
  dirPath: import.meta.dir,
  id: "uk-prime-ministers-taking-office",
  minScore: 0,
  title: "U.K. Prime Ministers Taking Office",
});
