import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import {
  DIFFICULTY_MIN_PAGE_VIEWS,
  getDifficultyPoolSize,
  MIN_ROUTE_CARD_COUNT,
} from "../../lib/free-play-difficulty-rules";
import { Card } from "../../types/cards";
import { DeckDifficultyCounts, DeckNode } from "../../types/decks";
import { textLooksUnsafeForCards } from "../card-safety";
import { Deck, getAllDeckDefinitions, rootDeck } from "../deck-tree";
import { QueryDefinition, SourceRow } from "../query-definition";
import { loadQueryDefinitions } from "../query-definitions";
import {
  resolveEnwikiMetadata,
  resolveEnwikiPageViews,
} from "../wikidata/enwiki-metadata";

type CliArgs = {
  queryIds: string[];
};

type BuiltCard = {
  fact: string;
  id: string;
  image: string | null;
  pageViews: number | null;
  popularityScore: number;
  qid: string;
  sourceScore: number;
  sourceRow: SourceRow;
  subtitle: string | null;
  title: string;
  wikidataUrl: string | null;
  wikipediaUrl: string | null;
  wikipediaTitle: string | null;
  year: number;
};

type BuiltDeck = {
  cards: Card[];
  difficultyCounts: DeckDifficultyCounts;
  frequency: number;
  hidden: boolean;
  id: string;
  minScore: number;
  slug: string;
  themeHue: number;
  title: string;
};

function splitFirstSentence(value: string): string {
  const segmenterCtor = Intl.Segmenter as
    | (new (
        locales?: string | string[],
        options?: Intl.SegmenterOptions,
      ) => Intl.Segmenter)
    | undefined;
  if (segmenterCtor) {
    const segmenter = new segmenterCtor("en", { granularity: "sentence" });
    const iterator = segmenter.segment(value)[Symbol.iterator]();
    const first = iterator.next();
    if (!first.done && typeof first.value.segment === "string") {
      return first.value.segment;
    }
  }

  const match = value.match(/^.+?[.!?](?=\s|$)/u);
  return match?.[0] ?? value;
}

type BuildSummary = {
  availableCount: number;
  builtCount: number;
  fetchedAt: string;
  id: string;
  rejectedCount: number;
  rejectionReasons: Record<string, number>;
  title: string;
};

type BuildQueryDefinition = QueryDefinition;

type RejectionReason =
  | "below-min-score"
  | "duplicate-card"
  | "empty-title"
  | "missing-english-wikipedia"
  | "missing-image"
  | "missing-wikipedia-summary"
  | "nsfw-content"
  | "unsupported-image-format"
  | "missing-row-file"
  | "qid-in-text"
  | "subtitle-has-year"
  | "text-too-long"
  | "title-has-year"
  | "unusable-year";

const QID_PATTERN = /\bQ\d+\b/;
const PUBLIC_DECKS_DIR = path.join("public", "decks");
const MIN_CARD_PAGE_VIEWS = 1_000;

function roundFrequency(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function formatDurationMs(durationMs: number): string {
  if (durationMs < 1_000) {
    return `${durationMs}ms`;
  }

  return `${(durationMs / 1_000).toFixed(2)}s`;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { queryIds: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--query") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--query requires a query id");
      }

      args.queryIds.push(value);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function pickQueries(
  queries: BuildQueryDefinition[],
  queryIds: string[],
): BuildQueryDefinition[] {
  if (queryIds.length === 0) {
    return queries;
  }

  const knownQueryIds = new Set(queries.map((query) => query.id));
  for (const queryId of queryIds) {
    if (!knownQueryIds.has(queryId)) {
      throw new Error(`Unknown query id: ${queryId}`);
    }
  }

  const wanted = new Set(queryIds);
  return queries.filter((query) => wanted.has(query.id));
}

async function readRows(
  query: BuildQueryDefinition,
): Promise<SourceRow[] | null> {
  try {
    const rowsText = await readFile(
      path.join(query.dirPath, "rows.json"),
      "utf8",
    );
    return JSON.parse(rowsText) as SourceRow[];
  } catch {
    return null;
  }
}

function renderTemplate(template: string, row: SourceRow): string {
  return template.replaceAll(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => {
    return row[key] ?? "";
  });
}

function cleanText(value: string): string {
  return value.replaceAll(/\s+/g, " ").trim().replaceAll(" .", ".");
}

function firstSentenceFromSummaryExtract(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const cleaned = cleanText(value);
  if (cleaned.length === 0) {
    return null;
  }

  const firstSentence = cleanText(splitFirstSentence(cleaned));
  return firstSentence.length > 0 ? firstSentence : null;
}

function capitalizeFirstLetter(value: string): string {
  const letterIndex = value.search(/\p{L}/u);
  if (letterIndex === -1) {
    return value;
  }

  return (
    value.slice(0, letterIndex) +
    value.charAt(letterIndex).toUpperCase() +
    value.slice(letterIndex + 1)
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

function looksLikeYear(value: string): boolean {
  return /\b-?\d{3,4}\b/.test(value);
}

function addReject(
  counts: Record<string, number>,
  reason: RejectionReason,
): null {
  counts[reason] = (counts[reason] ?? 0) + 1;
  return null;
}

function renderCardText(
  template: string | ((row: SourceRow) => string | null | undefined),
  row: SourceRow,
): string {
  const value =
    typeof template === "function"
      ? template(row)
      : renderTemplate(template, row);
  return value ?? "";
}

function buildCard(
  query: BuildQueryDefinition,
  row: SourceRow,
  rejectionReasons: Record<string, number>,
): BuiltCard | null {
  const preset = query.cards;
  const title = capitalizeFirstLetter(
    cleanText(renderCardText(preset.titleTemplate, row)),
  );
  const subtitleTemplate = preset.subtitleTemplate;
  const subtitle = subtitleTemplate
    ? capitalizeFirstLetter(cleanText(renderCardText(subtitleTemplate, row)))
    : "";
  const year = Number(row.year);
  const sourceScore = Number(row.sitelinks ?? 0);
  const qid = row.item?.match(/Q\d+$/)?.[0] ?? row.item ?? query.id;
  const titleSlug = slugify(title);

  if (!Number.isFinite(year)) {
    return addReject(rejectionReasons, "unusable-year");
  }

  if (!Number.isFinite(sourceScore) || sourceScore < query.minScore) {
    return addReject(rejectionReasons, "below-min-score");
  }

  if (title.length === 0) {
    return addReject(rejectionReasons, "empty-title");
  }

  if (
    title.length > (preset.maxTitleLength ?? 80) ||
    subtitle.length > (preset.maxSubtitleLength ?? 80)
  ) {
    return addReject(rejectionReasons, "text-too-long");
  }

  if (QID_PATTERN.test(title) || QID_PATTERN.test(subtitle)) {
    return addReject(rejectionReasons, "qid-in-text");
  }

  if (looksLikeYear(title)) {
    return addReject(rejectionReasons, "title-has-year");
  }

  if (subtitle.length > 0 && looksLikeYear(subtitle)) {
    return addReject(rejectionReasons, "subtitle-has-year");
  }

  return {
    fact: "",
    id: `${query.id}:${qid}:${year}:${titleSlug || "card"}`,
    image: null,
    pageViews: null,
    popularityScore: sourceScore,
    qid,
    sourceScore,
    sourceRow: row,
    subtitle: subtitle.length > 0 ? subtitle : null,
    title,
    wikidataUrl: qid.startsWith("Q")
      ? `https://www.wikidata.org/wiki/${qid}`
      : null,
    wikipediaTitle: null,
    wikipediaUrl: null,
    year,
  };
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function getWikipediaSlug(url: string | null): string | null {
  if (!url) {
    return null;
  }

  const prefix = "https://en.wikipedia.org/wiki/";
  if (!url.startsWith(prefix)) {
    return null;
  }

  return url.slice(prefix.length);
}

function isSupportedImageFilename(image: string): boolean {
  return !/\.tiff?$/iu.test(image);
}

function shouldRejectForNsfw(card: BuiltCard): boolean {
  return [
    card.title,
    card.subtitle,
    card.fact,
    card.wikipediaTitle,
    card.image,
  ].some((value) => textLooksUnsafeForCards(value));
}

function toCard(card: BuiltCard): Card | null {
  if (!card.image) {
    return null;
  }

  return {
    qid: card.qid,
    title: card.title,
    subtitle: card.subtitle,
    year: card.year,
    fact: card.fact,
    wikipediaSlug: getWikipediaSlug(card.wikipediaUrl),
    image: card.image,
    pageViews: card.pageViews,
  };
}

async function hydrateWikipediaMetadata(
  cards: BuiltCard[],
  rejectionReasons: Record<string, number>,
  log: (message: string) => void,
): Promise<{
  cards: BuiltCard[];
  metadataDurationMs: number;
  metadataStats: Awaited<ReturnType<typeof resolveEnwikiMetadata>>["stats"];
}> {
  const startedAt = Date.now();
  const qids = cards
    .map((card) => card.qid)
    .filter((qid) => qid.startsWith("Q"));
  if (qids.length === 0) {
    return {
      cards,
      metadataDurationMs: 0,
      metadataStats: {
        imageBatchCount: 0,
        imageCacheHits: 0,
        imageCacheMisses: 0,
        imageRequestCount: 0,
        imageTitlesRequested: 0,
        imagesResolved: 0,
        imagesResolvedAsNull: 0,
        qidsRequested: 0,
        summariesResolved: 0,
        summariesResolvedAsNull: 0,
        summaryBatchCount: 0,
        summaryCacheHits: 0,
        summaryCacheMisses: 0,
        summaryRequestCount: 0,
        sitelinkBatchCount: 0,
        sitelinkCacheHits: 0,
        sitelinkCacheMisses: 0,
        sitelinkRequestCount: 0,
        sitelinksResolved: 0,
        totalDurationMs: 0,
        uniqueQids: 0,
      },
    };
  }

  const { metadataByQid, stats } = await resolveEnwikiMetadata(qids, { log });
  const hydratedCards = cards
    .map((card) => {
      const metadata = metadataByQid[card.qid];
      const fact = firstSentenceFromSummaryExtract(metadata?.summaryExtract);
      if (fact === null) {
        addReject(rejectionReasons, "missing-wikipedia-summary");
        return null;
      }

      return {
        ...card,
        fact,
        image: metadata?.image ?? null,
        wikipediaTitle: metadata?.wikipediaTitle ?? null,
        wikipediaUrl: metadata?.wikipediaUrl ?? null,
      };
    })
    .filter((card): card is BuiltCard => card !== null)
    .filter((card) => {
      if (card.wikipediaTitle && card.wikipediaUrl) {
        return true;
      }

      addReject(rejectionReasons, "missing-english-wikipedia");
      return false;
    });

  return {
    cards: hydratedCards,
    metadataDurationMs: Date.now() - startedAt,
    metadataStats: stats,
  };
}

async function hydratePageViews(
  cards: BuiltCard[],
  log: (message: string) => void,
): Promise<{
  cards: BuiltCard[];
  pageViewsDurationMs: number;
  pageViewsStats: Awaited<ReturnType<typeof resolveEnwikiPageViews>>["stats"];
}> {
  const startedAt = Date.now();
  const entries = cards
    .map((card) =>
      card.wikipediaTitle
        ? {
            qid: card.qid,
            wikipediaTitle: card.wikipediaTitle,
          }
        : null,
    )
    .filter(
      (entry): entry is { qid: string; wikipediaTitle: string } =>
        entry !== null,
    );

  if (entries.length === 0) {
    return {
      cards,
      pageViewsDurationMs: 0,
      pageViewsStats: {
        cacheHits: 0,
        cacheMisses: 0,
        qidsRequested: 0,
        requestCount: 0,
        resolved: 0,
        resolvedAsNull: 0,
        targetMonth: "unknown",
        totalDurationMs: 0,
        uniqueQids: 0,
      },
    };
  }

  const { pageViewsByQid, stats } = await resolveEnwikiPageViews(entries, {
    log,
  });
  return {
    cards: cards.map((card) => {
      const pageViews = pageViewsByQid[card.qid] ?? null;
      return {
        ...card,
        pageViews,
        popularityScore: pageViews ?? card.sourceScore,
      };
    }),
    pageViewsDurationMs: Date.now() - startedAt,
    pageViewsStats: stats,
  };
}

function dedupeCards(
  cards: BuiltCard[],
  rejectionReasons: Record<string, number>,
): BuiltCard[] {
  const seenIds = new Set<string>();
  const deduped: BuiltCard[] = [];

  for (const card of cards) {
    if (seenIds.has(card.id)) {
      addReject(rejectionReasons, "duplicate-card");
      continue;
    }

    seenIds.add(card.id);
    deduped.push(card);
  }

  return deduped;
}

function dedupeMergedCards(cards: BuiltCard[]): BuiltCard[] {
  const seenKeys = new Set<string>();
  const deduped: BuiltCard[] = [];

  for (const card of cards) {
    const key = card.qid;
    if (seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    deduped.push(card);
  }

  return deduped;
}

function buildDeckCards(deck: Deck, cards: BuiltCard[]): BuiltCard[] {
  return cards.filter((card) => {
    if (deck.rowFilter && !deck.rowFilter(card.sourceRow)) {
      return false;
    }

    if (deck.minYear !== undefined && card.year < deck.minYear) {
      return false;
    }

    if (deck.maxYear !== undefined && card.year > deck.maxYear) {
      return false;
    }

    return true;
  });
}

function buildDeck(
  deck: Deck,
  cards: BuiltCard[],
  frequency: number,
): { builtDeck: BuiltDeck; selectedCards: BuiltCard[] } {
  const mergedCards = dedupeMergedCards(
    [...cards].sort(
      (left, right) =>
        right.popularityScore - left.popularityScore ||
        right.sourceScore - left.sourceScore ||
        left.year - right.year,
    ),
  );
  const selectedCards = mergedCards.filter((card) => {
    return card.pageViews !== null && card.pageViews >= MIN_CARD_PAGE_VIEWS;
  });

  const runtimeCards = selectedCards
    .map((card) => toCard(card))
    .filter((card): card is Card => card !== null);

  return {
    builtDeck: {
      cards: runtimeCards,
      difficultyCounts: {
        easy: 0,
        normal: 0,
        hard: 0,
      },
      frequency,
      hidden: deck.hidden ?? false,
      id: deck.id,
      minScore:
        (deck.sources ?? []).length > 0
          ? Math.min(...(deck.sources ?? []).map((source) => source.minScore))
          : MIN_CARD_PAGE_VIEWS,
      slug: deck.slug,
      themeHue: deck.themeHue,
      title: deck.title,
    },
    selectedCards,
  };
}

function formatRejectionReasons(
  rejectionReasons: Record<string, number>,
): string {
  return Object.entries(rejectionReasons)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([reason, count]) => `${reason}=${count}`)
    .join(", ");
}

async function buildCardsForQuery(
  query: BuildQueryDefinition,
): Promise<BuiltCard[]> {
  const queryStartedAt = Date.now();
  const fetchedAt = new Date().toISOString();
  console.log(`[query:${query.id}] start`);

  const rowsStartedAt = Date.now();
  const rows = await readRows(query);
  const rowsDurationMs = Date.now() - rowsStartedAt;
  const rejectionReasons: Record<string, number> = {};

  if (rows === null) {
    rejectionReasons["missing-row-file"] = 1;
    console.log(
      `[query:${query.id}] missing rows.json after ${formatDurationMs(rowsDurationMs)}`,
    );
    return [];
  }
  console.log(
    `[query:${query.id}] rows loaded: ${rows.length} row(s) in ${formatDurationMs(rowsDurationMs)}`,
  );

  const buildStartedAt = Date.now();
  const builtCards = dedupeCards(
    rows
      .map((row) => buildCard(query, row, rejectionReasons))
      .filter((card): card is BuiltCard => card !== null),
    rejectionReasons,
  );
  const buildDurationMs = Date.now() - buildStartedAt;
  console.log(
    `[query:${query.id}] built ${builtCards.length} candidate card(s) in ${formatDurationMs(buildDurationMs)}`,
  );

  const metadataLog = (message: string) => {
    console.log(`[query:${query.id}] ${message}`);
  };
  const {
    cards: builtCardsWithWikipedia,
    metadataDurationMs,
    metadataStats,
  } = await hydrateWikipediaMetadata(builtCards, rejectionReasons, metadataLog);
  console.log(
    `[query:${query.id}] metadata hydrated in ${formatDurationMs(metadataDurationMs)}; sitelink hits=${metadataStats.sitelinkCacheHits}, sitelink fetched=${metadataStats.sitelinkCacheMisses}, image hits=${metadataStats.imageCacheHits}, image fetched=${metadataStats.imageTitlesRequested}, summary hits=${metadataStats.summaryCacheHits}, summary fetched=${metadataStats.summaryRequestCount}`,
  );
  const {
    cards: builtCardsWithPopularity,
    pageViewsDurationMs,
    pageViewsStats,
  } = await hydratePageViews(builtCardsWithWikipedia, metadataLog);
  console.log(
    `[query:${query.id}] pageviews hydrated in ${formatDurationMs(pageViewsDurationMs)} for ${pageViewsStats.targetMonth}; cache hits=${pageViewsStats.cacheHits}, fetched=${pageViewsStats.cacheMisses}, resolved=${pageViewsStats.resolved}, missing=${pageViewsStats.resolvedAsNull}`,
  );
  const safeForWorkCards = builtCardsWithPopularity.filter((card) => {
    if (shouldRejectForNsfw(card)) {
      addReject(rejectionReasons, "nsfw-content");
      return false;
    }

    return true;
  });
  const cardsWithImages = safeForWorkCards.filter((card) => {
    if (!card.image) {
      addReject(rejectionReasons, "missing-image");
      return false;
    }

    if (!isSupportedImageFilename(card.image)) {
      addReject(rejectionReasons, "unsupported-image-format");
      return false;
    }

    return true;
  });
  const availableCount = cardsWithImages.length;

  const summary: BuildSummary = {
    availableCount,
    builtCount: cardsWithImages.length,
    fetchedAt,
    id: query.id,
    rejectedCount: rows.length - availableCount,
    rejectionReasons,
    title: query.title,
  };

  console.log(
    `[query:${query.id}] done in ${formatDurationMs(Date.now() - queryStartedAt)}; built ${summary.builtCount}/${summary.availableCount}, rejected ${summary.rejectedCount}`,
  );
  if (Object.keys(summary.rejectionReasons).length > 0) {
    console.log(
      `[query:${query.id}] skips: ${formatRejectionReasons(summary.rejectionReasons)}`,
    );
  }

  return cardsWithImages;
}

function collectLeafDecks(node: Deck): Deck[] {
  if ((node.children ?? []).length === 0) {
    return [node];
  }

  return (node.children ?? []).flatMap((child) => collectLeafDecks(child));
}

function getDifficultyPool(
  cards: Card[],
  difficulty: keyof DeckDifficultyCounts,
): Card[] {
  const poolSize = getDifficultyPoolSize(cards.length, difficulty);

  return cards.slice(0, poolSize);
}

function countDifficultyPlayableYearsInDeckSubtree(
  node: Deck,
  builtDecksById: ReadonlyMap<string, BuiltDeck>,
): DeckDifficultyCounts {
  const yearsByDifficulty = {
    easy: new Set<number>(),
    normal: new Set<number>(),
    hard: new Set<number>(),
  };

  for (const leaf of collectLeafDecks(node)) {
    const builtDeck = builtDecksById.get(leaf.id);
    if (!builtDeck) {
      continue;
    }

    for (const difficulty of Object.keys(DIFFICULTY_MIN_PAGE_VIEWS) as Array<
      keyof typeof DIFFICULTY_MIN_PAGE_VIEWS
    >) {
      for (const card of getDifficultyPool(builtDeck.cards, difficulty)) {
        if ((card.pageViews ?? 0) >= DIFFICULTY_MIN_PAGE_VIEWS[difficulty]) {
          yearsByDifficulty[difficulty].add(card.year);
        }
      }
    }
  }

  return {
    easy: yearsByDifficulty.easy.size,
    normal: yearsByDifficulty.normal.size,
    hard: yearsByDifficulty.hard.size,
  };
}

function populateDeckDifficultyCountsForTree(
  builtDecksById: Map<string, BuiltDeck>,
): void {
  function visit(node: Deck): void {
    const builtDeck = builtDecksById.get(node.id);
    if (!builtDeck) {
      throw new Error(`Missing deck ${node.id} while hydrating counts`);
    }

    builtDecksById.set(node.id, {
      ...builtDeck,
      difficultyCounts: countDifficultyPlayableYearsInDeckSubtree(
        node,
        builtDecksById,
      ),
    });

    (node.children ?? []).forEach((child) => visit(child));
  }

  visit(rootDeck);
}

function countPlayableCardsInDeckSubtree(
  node: Deck,
  builtDecksById: ReadonlyMap<string, BuiltDeck>,
): number {
  const qids = new Set<string>();

  for (const leaf of collectLeafDecks(node)) {
    const builtDeck = builtDecksById.get(leaf.id);
    if (!builtDeck) {
      continue;
    }

    for (const card of builtDeck.cards) {
      if ((card.pageViews ?? 0) < MIN_CARD_PAGE_VIEWS) {
        continue;
      }

      qids.add(card.qid);
    }
  }

  return qids.size;
}

function validateVisibleDeckTree(
  builtDecksById: ReadonlyMap<string, BuiltDeck>,
): void {
  const errors: string[] = [];

  function formatDeckPath(slugPath: readonly string[]): string {
    return slugPath.length === 0 ? "/play" : `/play/${slugPath.join("/")}`;
  }

  function visit(node: Deck, slugPath: readonly string[]): boolean {
    const visibleChildren = (node.children ?? []).filter(
      (child) => !child.hidden,
    );
    const subtreeCount = countPlayableCardsInDeckSubtree(node, builtDecksById);

    if (visibleChildren.length === 0) {
      if (!node.hidden && subtreeCount < MIN_ROUTE_CARD_COUNT) {
        errors.push(
          `${formatDeckPath(slugPath)} has ${subtreeCount} public-eligible cards; visible decks need at least ${MIN_ROUTE_CARD_COUNT}. Hide, merge, or remove it.`,
        );
        return false;
      }

      return subtreeCount >= MIN_ROUTE_CARD_COUNT;
    }

    let hasVisiblePlayableChild = false;

    for (const child of visibleChildren) {
      if (visit(child, [...slugPath, child.slug])) {
        hasVisiblePlayableChild = true;
      }
    }

    if (!node.hidden && !hasVisiblePlayableChild) {
      errors.push(
        `${formatDeckPath(slugPath)} has no visible playable children. Remove or restructure this deck.`,
      );
      return false;
    }

    return hasVisiblePlayableChild;
  }

  visit(rootDeck, []);

  if (errors.length > 0) {
    throw new Error(
      `Deck tree validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}`,
    );
  }
}

async function writeDeckArtifacts(builtDecks: BuiltDeck[]): Promise<void> {
  await mkdir(PUBLIC_DECKS_DIR, { recursive: true });
  const existingPublicFiles = await readdir(PUBLIC_DECKS_DIR);
  await Promise.all(
    existingPublicFiles
      .filter((fileName) => fileName.endsWith(".json"))
      .map((fileName) => rm(path.join(PUBLIC_DECKS_DIR, fileName))),
  );

  const builtDeckMap = new Map(builtDecks.map((deck) => [deck.id, deck]));

  function buildManifestNode(deckId: string): DeckNode {
    const builtDeck = builtDeckMap.get(deckId);
    if (!builtDeck) {
      throw new Error(`Missing deck ${deckId} while building manifest tree`);
    }

    const sourceChildren =
      rootDeck.id === deckId
        ? (rootDeck.children ?? [])
        : (() => {
            const sourceDeck = getAllDeckDefinitions().find(
              (deck) => deck.id === deckId,
            );
            if (!sourceDeck) {
              throw new Error(
                `Missing source deck ${deckId} while building manifest tree`,
              );
            }

            return sourceDeck.children ?? [];
          })();
    const children = sourceChildren.map((child) => buildManifestNode(child.id));
    const isRootNode = deckId === rootDeck.id;

    return {
      difficultyCounts: builtDeck.difficultyCounts,
      id: builtDeck.id,
      minScore: builtDeck.minScore,
      slug: builtDeck.slug,
      themeHue: builtDeck.themeHue,
      title: builtDeck.title,
      ...(!isRootNode ? { frequency: builtDeck.frequency } : {}),
      ...(builtDeck.hidden && !isRootNode ? { hidden: true } : {}),
      ...(children.length > 0 ? { children } : {}),
    };
  }

  const manifest = buildManifestNode(rootDeck.id);

  for (const builtDeck of builtDecks) {
    const sourceDeck = getAllDeckDefinitions().find(
      (deck) => deck.id === builtDeck.id,
    );
    if (!sourceDeck) {
      throw new Error(
        `Missing source deck ${builtDeck.id} while writing deck payload`,
      );
    }

    if ((sourceDeck.children ?? []).length > 0) {
      continue;
    }

    await writeJson(
      path.join(PUBLIC_DECKS_DIR, `${builtDeck.id}.json`),
      builtDeck.cards,
    );
  }
  await writeJson(path.join(PUBLIC_DECKS_DIR, "index.json"), manifest);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const allQueries = await loadQueryDefinitions();

  if (args.queryIds.length > 0) {
    const selectedQueries = pickQueries(allQueries, args.queryIds);
    console.log(
      `Ignoring --query and rebuilding all ${allQueries.length} queries so built decks stay complete. Requested: ${selectedQueries.map((query) => query.id).join(", ")}`,
    );
  }
  const sourceCardsById = new Map<string, BuiltCard[]>();

  for (const query of allQueries) {
    sourceCardsById.set(query.id, await buildCardsForQuery(query));
  }

  const candidateCardsByDeckId = new Map<string, BuiltCard[]>();

  for (const deck of getAllDeckDefinitions()) {
    candidateCardsByDeckId.set(
      deck.id,
      buildDeckCards(
        deck,
        (deck.sources ?? []).flatMap(
          (source) => sourceCardsById.get(source.id) ?? [],
        ),
      ),
    );
  }

  const builtDecksById = new Map<string, BuiltDeck>();

  for (const deck of getAllDeckDefinitions()) {
    const { builtDeck } = buildDeck(
      deck,
      candidateCardsByDeckId.get(deck.id) ?? [],
      roundFrequency(deck.frequency),
    );
    builtDecksById.set(builtDeck.id, builtDeck);
  }

  populateDeckDifficultyCountsForTree(builtDecksById);
  validateVisibleDeckTree(builtDecksById);

  await writeDeckArtifacts(
    Array.from(builtDecksById.values()).sort((a, b) =>
      a.id.localeCompare(b.id),
    ),
  );
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
