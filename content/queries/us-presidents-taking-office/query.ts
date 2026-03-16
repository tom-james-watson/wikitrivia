import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes president of the United States",
  },
  dirPath: import.meta.dir,
  id: "us-presidents-taking-office",
  minScore: 0,
  title: "U.S. Presidents Taking Office",
});
