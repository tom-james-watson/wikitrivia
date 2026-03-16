export type FreePlayRootView = "browse" | "featured" | "landing";

export interface FeaturedFreePlayDeck {
  key: string;
  routeSlug: string;
  slugPath: string[];
  text: string;
}

export const FEATURED_FREE_PLAY_DECKS: readonly FeaturedFreePlayDeck[] = [
  {
    key: "featured-us-presidents",
    routeSlug: "us-presidents",
    slugPath: ["leaders", "politicians", "americas", "us"],
    text: "U.S. Presidents",
  },
  {
    key: "featured-english-monarchs",
    routeSlug: "english-monarchs",
    slugPath: ["leaders", "rulers", "europe", "england"],
    text: "English Monarchs",
  },
  {
    key: "featured-roman-empire",
    routeSlug: "roman-empire",
    slugPath: ["leaders", "rulers", "europe", "rome"],
    text: "Roman Emperors",
  },
  {
    key: "featured-wars",
    routeSlug: "wars",
    slugPath: ["history", "wars"],
    text: "Wars",
  },
  {
    key: "featured-films",
    routeSlug: "films",
    slugPath: ["entertainment", "films"],
    text: "Films",
  },
  {
    key: "featured-music",
    routeSlug: "music",
    slugPath: ["entertainment", "music"],
    text: "Music",
  },
  {
    key: "featured-books",
    routeSlug: "books",
    slugPath: ["entertainment", "books"],
    text: "Books",
  },
  {
    key: "featured-video-games",
    routeSlug: "video-games",
    slugPath: ["technology", "video-games"],
    text: "Video Games",
  },
] as const;

export function getRootFreePlayPath(view: FreePlayRootView): string {
  switch (view) {
    case "browse":
      return "/play/browse";
    case "featured":
      return "/play/featured";
    case "landing":
    default:
      return "/play";
  }
}

export function prefixPlayPath(path: string, view: FreePlayRootView): string {
  if (
    view !== "browse" ||
    !path.startsWith("/play") ||
    path.startsWith("/play/browse")
  ) {
    return path;
  }

  const suffix = path.slice("/play".length);
  return `${getRootFreePlayPath("browse")}${suffix}`;
}
