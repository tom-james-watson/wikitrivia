import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel} is established",
    subtitleTemplate: "Colonial empire",
  },
  dirPath: import.meta.dir,
  id: "colonial-empires-creation-year",
  minScore: 15,
  title: "Colonial Empires By Creation Year",
});
