import rootDeckTree from "../public/decks/index.json";
import { DeckNode } from "../types/decks";
import {
  CategoryDefinition,
  FreePlayBreadcrumb,
  FreePlayDefinition,
  FreePlayGroupDefinition,
  SelectionRoute,
} from "../types/routes";
import {
  createDeckNodeMap,
  getDeckNodeBySlugPath,
  getVisibleDeckNodeChildren,
  hasVisibleDeckNodeChildren,
} from "./deck-tree";
import { FEATURED_FREE_PLAY_DECKS } from "./free-play-navigation";

type DeckLocation = {
  node: DeckNode;
  parentSlugPath: string[];
  slugPath: string[];
};

const ROOT_DECK = rootDeckTree as DeckNode;
const RUNTIME_DECK_MAP = createDeckNodeMap(ROOT_DECK);
const DECK_LOCATION_MAP = createDeckLocationMap(ROOT_DECK);

function createDeckLocationMap(rootDeck: DeckNode): Map<string, DeckLocation> {
  const locationMap = new Map<string, DeckLocation>();

  function visit(node: DeckNode, parentSlugPath: string[]): void {
    const slugPath =
      node.id === ROOT_DECK.id ? [] : [...parentSlugPath, node.slug];

    locationMap.set(node.id, {
      node,
      parentSlugPath,
      slugPath,
    });

    getDeckNodeChildren(node).forEach((child) => visit(child, slugPath));
  }

  visit(rootDeck, []);
  return locationMap;
}

function getDeckNodeChildren(node: DeckNode): DeckNode[] {
  return node.children ?? [];
}

function sortDeckNodesByFrequency(left: DeckNode, right: DeckNode): number {
  const leftFrequency = left.frequency ?? 0;
  const rightFrequency = right.frequency ?? 0;

  if (leftFrequency !== rightFrequency) {
    return rightFrequency - leftFrequency;
  }

  return left.title.localeCompare(right.title);
}

function toPath(slugPath: readonly string[]): string {
  return slugPath.length > 0 ? `/play/${slugPath.join("/")}` : "/play";
}

function getDeckBySlugPath(slugPath: readonly string[]): DeckNode | null {
  return getDeckNodeBySlugPath(RUNTIME_DECK_MAP, ROOT_DECK.id, slugPath);
}

function getDeckLocation(nodeId: string): DeckLocation | null {
  return DECK_LOCATION_MAP.get(nodeId) ?? null;
}

function toRouteDefinition(deck: DeckNode): FreePlayDefinition {
  const visibleChildren = getVisibleDeckNodeChildren(deck).sort(
    sortDeckNodesByFrequency,
  );

  if (visibleChildren.length === 0) {
    return {
      kind: "leaf",
      nodeId: deck.id,
      slug: deck.slug,
      title: deck.title,
    };
  }

  return {
    children: visibleChildren.map((child) => toRouteDefinition(child)),
    kind: "group",
    nodeId: deck.id,
    slug: deck.slug,
    title: deck.title,
  };
}

const CATEGORY_DEFINITIONS: CategoryDefinition[] = getVisibleDeckNodeChildren(
  ROOT_DECK,
)
  .sort(sortDeckNodesByFrequency)
  .map((deck) => {
    const definition = toRouteDefinition(deck);
    if (definition.kind !== "group") {
      throw new Error(`Top-level deck ${deck.id} must have visible children`);
    }

    return definition;
  });

function buildBreadcrumbs(
  slugPath: readonly string[],
  options: {
    includeCurrent?: boolean;
  } = {},
): FreePlayBreadcrumb[] {
  const { includeCurrent = true } = options;
  const breadcrumbs: FreePlayBreadcrumb[] = [];

  slugPath.forEach((_, index) => {
    const pathSlice = slugPath.slice(0, index + 1);
    const deck = getDeckBySlugPath(pathSlice);
    if (!deck) {
      return;
    }

    const isCurrent = index === slugPath.length - 1;
    if (isCurrent && !includeCurrent) {
      return;
    }

    breadcrumbs.push({
      href: toPath(pathSlice),
      label: deck.title,
    });
  });

  return breadcrumbs;
}

function createSelectionRoute(
  kind: SelectionRoute["kind"],
  nodeId: string,
): SelectionRoute {
  return {
    kind,
    maxYear: null,
    minYear: null,
    nodeId,
  };
}

export function getCategoryDefinitions(): CategoryDefinition[] {
  return CATEGORY_DEFINITIONS;
}

export function getCategoryDefinition(
  categorySlug: string,
): CategoryDefinition | null {
  return (
    CATEGORY_DEFINITIONS.find((category) => category.slug === categorySlug) ??
    null
  );
}

export function getFreePlayGroupDefinition(
  slugPath: readonly string[],
): FreePlayGroupDefinition | null {
  if (slugPath.length === 0) {
    return null;
  }

  const deck = getDeckBySlugPath(slugPath);
  if (!deck || !hasVisibleDeckNodeChildren(deck)) {
    return null;
  }

  const definition = toRouteDefinition(deck);
  return definition.kind === "group" ? definition : null;
}

export function getAllSelectionRoute(): SelectionRoute {
  return createSelectionRoute("all", ROOT_DECK.id);
}

export function getGroupAllSelectionRoute(
  slugPath: readonly string[],
): SelectionRoute | null {
  const deck = getDeckBySlugPath(slugPath);
  if (!deck || !hasVisibleDeckNodeChildren(deck)) {
    return null;
  }

  return createSelectionRoute("group-all", deck.id);
}

export function getGroupAllSelectionRouteForNode(
  nodeId: string,
): SelectionRoute | null {
  const deck = RUNTIME_DECK_MAP.get(nodeId);
  if (!deck || !hasVisibleDeckNodeChildren(deck)) {
    return null;
  }

  return createSelectionRoute("group-all", deck.id);
}

export function getLeafSelectionRoute(
  slugPath: readonly string[],
): SelectionRoute | null {
  const deck = getDeckBySlugPath(slugPath);
  if (!deck || hasVisibleDeckNodeChildren(deck)) {
    return null;
  }

  return createSelectionRoute("leaf", deck.id);
}

export function getLeafSelectionRouteForNode(
  nodeId: string,
): SelectionRoute | null {
  const deck = RUNTIME_DECK_MAP.get(nodeId);
  if (!deck || hasVisibleDeckNodeChildren(deck)) {
    return null;
  }

  return createSelectionRoute("leaf", deck.id);
}

export function getSelectorBreadcrumbs(
  slugPath: readonly string[],
): FreePlayBreadcrumb[] {
  return buildBreadcrumbs(slugPath, {
    includeCurrent: false,
  });
}

export function getSelectorBreadcrumbsForNode(
  nodeId: string,
): FreePlayBreadcrumb[] {
  const location = getDeckLocation(nodeId);
  if (!location) {
    return [];
  }

  return buildBreadcrumbs(location.slugPath, {
    includeCurrent: false,
  });
}

export function getDeckPath(nodeId: string): string {
  const location = getDeckLocation(nodeId);
  return location ? toPath(location.slugPath) : "/play";
}

export function getDeckSlugPath(nodeId: string): string[] {
  const location = getDeckLocation(nodeId);
  return location ? [...location.slugPath] : [];
}

export function getSelectionRoutePath(selectionRoute: SelectionRoute): string {
  if (selectionRoute.kind === "all") {
    return "/play/all";
  }

  const basePath = getDeckPath(selectionRoute.nodeId);
  return selectionRoute.kind === "group-all" ? `${basePath}/all` : basePath;
}

export function getSelectionRouteParentPath(
  selectionRoute: SelectionRoute,
): string {
  if (selectionRoute.kind === "all") {
    return "/play";
  }

  if (selectionRoute.kind === "group-all") {
    return getDeckPath(selectionRoute.nodeId);
  }

  const location = getDeckLocation(selectionRoute.nodeId);
  return location ? toPath(location.parentSlugPath) : "/play";
}

export function getSelectionRouteTitle(selectionRoute: SelectionRoute): string {
  if (selectionRoute.kind === "all" || selectionRoute.kind === "group-all") {
    return "All";
  }

  const deck = RUNTIME_DECK_MAP.get(selectionRoute.nodeId);
  return deck?.title ?? "All";
}

export function getSelectionRouteBreadcrumbs(
  selectionRoute: SelectionRoute,
): FreePlayBreadcrumb[] {
  if (selectionRoute.kind === "all") {
    return [];
  }

  const slugPath = getDeckSlugPath(selectionRoute.nodeId);
  return buildBreadcrumbs(slugPath, {
    includeCurrent: selectionRoute.kind === "group-all",
  });
}

export function getSelectionRouteShareLabel(
  selectionRoute: SelectionRoute,
): string {
  if (selectionRoute.kind === "all") {
    return "All";
  }

  const slugPath = getDeckSlugPath(selectionRoute.nodeId);
  return buildBreadcrumbs(slugPath, { includeCurrent: true })
    .map((breadcrumb) => breadcrumb.label)
    .join(" / ");
}

function visitDeck(
  deck: DeckNode,
  parentSlugPath: readonly string[],
  paths: string[][],
): void {
  const slugPath = [...parentSlugPath, deck.slug];
  const visibleChildren = getVisibleDeckNodeChildren(deck);

  if (visibleChildren.length === 0) {
    paths.push(slugPath);
    return;
  }

  paths.push(slugPath);
  paths.push([...slugPath, "all"]);

  visibleChildren.forEach((child) => {
    visitDeck(child, slugPath, paths);
  });
}

export function getAllPlayRoutePaths(): string[][] {
  const paths: string[][] = [[], ["all"]];

  getVisibleDeckNodeChildren(ROOT_DECK).forEach((deck) => {
    visitDeck(deck, [], paths);
  });

  const browsePaths = paths.map((path) => ["browse", ...path]);
  const featuredPaths = [
    ["featured"],
    ...FEATURED_FREE_PLAY_DECKS.map((deck) => ["featured", deck.routeSlug]),
  ];

  return [...paths, ...browsePaths, ...featuredPaths];
}
