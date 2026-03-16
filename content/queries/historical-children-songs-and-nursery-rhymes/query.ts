import { defineQuery } from "../../query-definition";
import { quotedItemLabel } from "../../query-row-helpers";

export default defineQuery({
  cards: {
    subtitleTemplate: "Children's song or nursery rhyme",
    titleTemplate: quotedItemLabel("dates to"),
  },
  dirPath: import.meta.dir,
  id: "historical-children-songs-and-nursery-rhymes",
  title: "Historical Children's Songs And Nursery Rhymes By Year",
});
