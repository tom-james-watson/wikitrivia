import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes prime minister of New Zealand",
  },
  dirPath: import.meta.dir,
  id: "new-zealand-prime-ministers-taking-office",
  minScore: 20,
  title: "New Zealand Prime Ministers Taking Office",
});
