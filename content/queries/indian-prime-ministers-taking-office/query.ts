import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes prime minister of India",
  },
  dirPath: import.meta.dir,
  id: "indian-prime-ministers-taking-office",
  minScore: 47,
  title: "Indian Prime Ministers Taking Office",
});
