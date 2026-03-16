import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes prime minister of Japan",
  },
  dirPath: import.meta.dir,
  id: "japanese-prime-ministers-taking-office",
  minScore: 26,
  title: "Japanese Prime Ministers Taking Office",
});
