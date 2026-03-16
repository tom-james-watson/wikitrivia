import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes chancellor of Germany",
  },
  dirPath: import.meta.dir,
  id: "german-chancellors-taking-office",
  minScore: 69,
  title: "German Chancellors Taking Office",
});
