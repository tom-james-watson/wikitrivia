import { PlayedCard } from "./cards";
import { PreparedCard } from "./game";

export type GameMode = "daily" | "free-play";

export interface FreePlayBreadcrumb {
  href?: string;
  label: string;
}

interface BaseFreePlayDefinition {
  slug: string;
  title: string;
  nodeId: string;
}

export interface FreePlayLeafDefinition extends BaseFreePlayDefinition {
  kind: "leaf";
  nodeId: string;
}

export interface FreePlayGroupDefinition extends BaseFreePlayDefinition {
  children: FreePlayDefinition[];
  kind: "group";
  nodeId: string;
}

export type FreePlayDefinition =
  | FreePlayGroupDefinition
  | FreePlayLeafDefinition;

export interface CategoryDefinition extends FreePlayGroupDefinition {}

export interface SubcategoryDefinition extends FreePlayLeafDefinition {}

export type SelectionRouteKind = "all" | "group-all" | "leaf";

export interface SelectionRoute {
  kind: SelectionRouteKind;
  maxYear: number | null;
  minYear: number | null;
  nodeId: string;
}

export interface DailyGameSnapshot {
  deckCursors: Array<{
    drawCursor: number;
    id: string;
  }>;
  dateKey: string;
  lives: number;
  next: PreparedCard | null;
  nextButOne: PreparedCard | null;
  played: PlayedCard[];
  randomState: number | null;
  recentDeckIds: string[];
}
