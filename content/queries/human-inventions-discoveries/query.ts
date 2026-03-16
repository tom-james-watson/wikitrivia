import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} dates to",
    subtitleTemplate: "Invention or discovery",
  },
  dirPath: import.meta.dir,
  id: "human-inventions-discoveries",
  minScore: 20,
  title: "Human-Attributed Inventions And Discoveries",
});
