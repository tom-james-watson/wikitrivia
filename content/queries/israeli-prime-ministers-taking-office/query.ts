import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes prime minister of Israel",
  },
  dirPath: import.meta.dir,
  id: "israeli-prime-ministers-taking-office",
  minScore: 20,
  title: "Israeli Prime Ministers Taking Office",
});
