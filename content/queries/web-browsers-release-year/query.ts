import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is released",
    subtitleTemplate: "Web browser",
  },
  dirPath: import.meta.dir,
  id: "web-browsers-release-year",
  minScore: 20,
  title: "Web Browsers By Release Year",
});
