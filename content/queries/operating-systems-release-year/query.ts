import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is released",
    subtitleTemplate: "Operating System",
  },
  dirPath: import.meta.dir,
  id: "operating-systems-release-year",
  minScore: 20,
  title: "Operating Systems By Release Year",
});
