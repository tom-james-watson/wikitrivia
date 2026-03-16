import rootDeckTree from "../../public/decks/index.json";
import { DeckNode } from "../../types/decks";
import {
  Deck,
  getAllDeckDefinitions,
  rootDeck as sourceRootDeck,
} from "../deck-tree";

const INDENT = "    ";

type CliOptions = {
  readonly maxDepth?: number;
};

function createSourceDeckMap(): ReadonlyMap<string, Deck> {
  return new Map(getAllDeckDefinitions().map((deck) => [deck.id, deck]));
}

function parseDepth(value: string | undefined): number {
  if (value === undefined) {
    throw new Error("Missing value for --depth");
  }

  const depth = Number(value);

  if (!Number.isInteger(depth) || depth < 0) {
    throw new Error(
      `Invalid --depth value "${value}". Use a non-negative integer.`,
    );
  }

  return depth;
}

function parseArgs(argv: readonly string[]): CliOptions {
  let maxDepth: number | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--depth") {
      maxDepth = parseDepth(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg.startsWith("--depth=")) {
      maxDepth = parseDepth(arg.slice("--depth=".length));
      continue;
    }

    throw new Error(`Unknown option "${arg}"`);
  }

  return { maxDepth };
}

function formatFrequency(
  node: DeckNode,
  sourceDeckMap: ReadonlyMap<string, Deck>,
): string {
  const frequency = node.frequency ?? sourceDeckMap.get(node.id)?.frequency;

  if (frequency === undefined) {
    throw new Error(`Missing frequency for deck ${node.id}`);
  }

  return frequency.toString();
}

function printDeckTree(
  node: DeckNode,
  sourceDeckMap: ReadonlyMap<string, Deck>,
  depth: number,
  maxDepth: number | undefined,
): void {
  const frequency = formatFrequency(node, sourceDeckMap);
  const { easy, normal, hard } = node.difficultyCounts;
  const indent = INDENT.repeat(depth);

  console.log(
    `${indent}${node.slug} [frequency: ${frequency}] [easy: ${easy}, medium: ${normal}, hard: ${hard}]`,
  );

  if (maxDepth !== undefined && depth >= maxDepth) {
    return;
  }

  const sortedChildren = [...(node.children ?? [])].sort((left, right) => {
    const leftFrequency =
      left.frequency ?? sourceDeckMap.get(left.id)?.frequency;
    const rightFrequency =
      right.frequency ?? sourceDeckMap.get(right.id)?.frequency;

    if (leftFrequency === undefined || rightFrequency === undefined) {
      throw new Error(
        `Missing frequency while sorting children of deck ${node.id}`,
      );
    }

    return (
      rightFrequency - leftFrequency || left.slug.localeCompare(right.slug)
    );
  });

  for (const child of sortedChildren) {
    printDeckTree(child, sourceDeckMap, depth + 1, maxDepth);
  }
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const sourceDeckMap = createSourceDeckMap();
  const manifestRootDeck = rootDeckTree as DeckNode;

  if (manifestRootDeck.id !== sourceRootDeck.id) {
    throw new Error(
      `Deck tree root mismatch: manifest=${manifestRootDeck.id}, source=${sourceRootDeck.id}`,
    );
  }

  printDeckTree(manifestRootDeck, sourceDeckMap, 0, options.maxDepth);
}

main();
