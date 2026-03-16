import { defineQuery } from "../../query-definition";

export default defineQuery({
  cards: {
    titleTemplate: "{itemLabel}",
    subtitleTemplate: "Protest, riot, or uprising",
  },
  dirPath: import.meta.dir,
  id: "protests-riots-and-uprisings-year",
  title: "Protests, Riots, and Uprisings By Year",
});
