import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} becomes Roman emperor",
  },
  dirPath: import.meta.dir,
  id: "roman-emperors-taking-office",
  minScore: 24,
  title: "Roman Emperors Taking Office",
});
