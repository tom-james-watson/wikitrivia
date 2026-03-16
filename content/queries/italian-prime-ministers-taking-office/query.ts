import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes prime minister of Italy",
  },
  dirPath: import.meta.dir,
  id: "italian-prime-ministers-taking-office",
  minScore: 40,
  title: "Italian Prime Ministers Taking Office",
});
