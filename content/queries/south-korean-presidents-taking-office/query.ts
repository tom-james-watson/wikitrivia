import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes president of South Korea",
  },
  dirPath: import.meta.dir,
  id: "south-korean-presidents-taking-office",
  minScore: 50,
  title: "South Korean Presidents Taking Office",
});
