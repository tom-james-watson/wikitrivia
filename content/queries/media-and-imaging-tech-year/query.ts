import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is invented",
    subtitleTemplate: "Invented by {inventorLabel}",
  },
  dirPath: import.meta.dir,
  id: "media-and-imaging-tech-year",
  minScore: 10,
  title: "Media And Imaging Tech By Invention Year",
});
