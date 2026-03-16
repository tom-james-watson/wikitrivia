import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { getWikimediaUserAgent } from "../api-env";
import { FetchRequestError, fetchJson } from "../fetch";

const WIKIDATA_API_ENDPOINT = "https://www.wikidata.org/w/api.php";
const WIKIPEDIA_API_ENDPOINT = "https://en.wikipedia.org/w/api.php";
const WIKIPEDIA_REST_API_ENDPOINT = "https://en.wikipedia.org/api/rest_v1";
const PAGEVIEWS_API_ENDPOINT =
  "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article";
const CACHE_FILE_PATH = path.join(
  process.cwd(),
  "content",
  "cache",
  "wikidata-enwiki-metadata.json",
);
const MAX_ATTEMPTS = 20;
const FALLBACK_RETRY_DELAY_MS = 5_000;
const MAXLAG_BACKOFF_CAP_MS = 1_800_000;
const DEFAULT_DELAY_MS = 1_000;
const ONE_YEAR_CACHE_TTL_MS = 365 * 24 * 60 * 60 * 1_000;
const WIKIDATA_MAX_LAG_SECONDS = 120;
const SITELINK_REQUEST_BATCH_SIZE = 50;
const IMAGE_REQUEST_BATCH_SIZE = 20;
const SUMMARY_REQUEST_BATCH_SIZE = 10;
const SUMMARY_RATE_LIMIT_WINDOW_MS = 1_000;
const SUMMARY_RATE_LIMIT_MAX_REQUESTS = 5;

type WikidataEntity = {
  id?: string;
  sitelinks?: {
    enwiki?: {
      title?: string;
      url?: string;
    };
  };
};

type WikidataEntitiesResponse = {
  error?: {
    code?: string;
    info?: string;
  };
  entities?: Record<string, WikidataEntity> | WikidataEntity[];
  success?: number;
};

type WikipediaPageMetadata = {
  missing?: boolean;
  pageimage?: string;
  pageprops?: {
    page_image?: string;
  };
  title?: string;
};

type WikipediaPageMetadataResponse = {
  query?: {
    normalized?: {
      from: string;
      to: string;
    }[];
    pages?: WikipediaPageMetadata[];
    redirects?: {
      from: string;
      to: string;
    }[];
  };
};

type WikipediaSummaryResponse = {
  extract?: string;
};

export type CachedEnwikiMetadata = {
  fetchedAt: string;
  image?: string | null;
  pageViews?: number | null;
  summaryExtract?: string | null;
  wikipediaTitle: string | null;
  wikipediaUrl: string | null;
};

type EnwikiMetadataCache = Record<string, CachedEnwikiMetadata>;

type ResolveLogFn = (message: string) => void;

export type ResolveEnwikiMetadataStats = {
  imageBatchCount: number;
  imageCacheHits: number;
  imageCacheMisses: number;
  imageRequestCount: number;
  imageTitlesRequested: number;
  imagesResolved: number;
  imagesResolvedAsNull: number;
  qidsRequested: number;
  summariesResolved: number;
  summariesResolvedAsNull: number;
  summaryBatchCount: number;
  summaryCacheHits: number;
  summaryCacheMisses: number;
  summaryRequestCount: number;
  sitelinkBatchCount: number;
  sitelinkCacheHits: number;
  sitelinkCacheMisses: number;
  sitelinkRequestCount: number;
  sitelinksResolved: number;
  totalDurationMs: number;
  uniqueQids: number;
};

type ResolveEnwikiMetadataOptions = {
  delayMs?: number;
  log?: ResolveLogFn;
  timeoutMs?: number;
};

type PageViewEntryInput = {
  qid: string;
  wikipediaTitle: string;
};

type PageViewsApiResponse = {
  items?: {
    views?: number;
  }[];
};

export type ResolveEnwikiPageViewsStats = {
  cacheHits: number;
  cacheMisses: number;
  qidsRequested: number;
  requestCount: number;
  resolved: number;
  resolvedAsNull: number;
  targetMonth: string;
  totalDurationMs: number;
  uniqueQids: number;
};

type ResolveEnwikiPageViewsOptions = {
  delayMs?: number;
  log?: ResolveLogFn;
  timeoutMs?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class SlidingWindowRateLimiter {
  private readonly timestamps: number[] = [];

  constructor(
    private readonly windowMs: number,
    private readonly maxRequestsPerWindow: number,
  ) {}

  async waitForTurn() {
    while (true) {
      const now = Date.now();
      while (
        this.timestamps.length > 0 &&
        now - this.timestamps[0] >= this.windowMs
      ) {
        this.timestamps.shift();
      }

      if (this.timestamps.length < this.maxRequestsPerWindow) {
        this.timestamps.push(now);
        return;
      }

      const oldestTimestamp = this.timestamps[0];
      const waitMs = Math.max(this.windowMs - (now - oldestTimestamp), 1);
      await sleep(waitMs);
    }
  }
}

const summaryRateLimiter = new SlidingWindowRateLimiter(
  SUMMARY_RATE_LIMIT_WINDOW_MS,
  SUMMARY_RATE_LIMIT_MAX_REQUESTS,
);

function parseRetryAfterMs(value: string | null | undefined): number | null {
  if (typeof value !== "string") {
    return null;
  }

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const retryAt = Date.parse(value);
  if (Number.isNaN(retryAt)) {
    return null;
  }

  return Math.max(retryAt - Date.now(), 0);
}

function parseMaxlagDelayMs(info: string | undefined): number | null {
  if (!info) {
    return null;
  }

  const match = info.match(/([0-9]+(?:\.[0-9]+)?)\s+seconds?\s+lagged/i);
  if (!match) {
    return null;
  }

  const seconds = Number(match[1]);
  if (!Number.isFinite(seconds) || seconds < 0) {
    return null;
  }

  return Math.ceil(seconds * 1_000);
}

function getWikidataMaxlagState(
  data: unknown,
  retryAfterHeader: string | null | undefined,
  attempt: number,
): { info: string | null; retryAfterMs: number } | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const error = "error" in data ? data.error : null;
  if (!error || typeof error !== "object") {
    return null;
  }

  const code = "code" in error ? error.code : null;
  if (code !== "maxlag") {
    return null;
  }

  const info =
    "info" in error && typeof error.info === "string" ? error.info : undefined;

  const baseRetryAfterMs =
    parseRetryAfterMs(retryAfterHeader) ??
    parseMaxlagDelayMs(info) ??
    FALLBACK_RETRY_DELAY_MS;
  const exponentialBackoffMs = Math.min(
    baseRetryAfterMs * 2 ** Math.max(attempt - 1, 0),
    MAXLAG_BACKOFF_CAP_MS,
  );

  return {
    info: info ?? null,
    retryAfterMs: exponentialBackoffMs,
  };
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatNumber(value: number | null): string {
  if (value === null) {
    return "missing";
  }

  return value.toLocaleString("en-US");
}

function formatMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}`;
}

function formatTimestamp(date: Date): string {
  return `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}0100`;
}

function getPreviousMonthRange(now = new Date()): {
  endTimestamp: string;
  month: string;
  startTimestamp: string;
} {
  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const previousMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
  );

  return {
    endTimestamp: formatTimestamp(currentMonthStart),
    month: formatMonthKey(previousMonthStart),
    startTimestamp: formatTimestamp(previousMonthStart),
  };
}

function isRetryableFetchError(error: unknown): error is FetchRequestError {
  if (!(error instanceof FetchRequestError)) {
    return false;
  }

  const status = error.status;
  if (status === 429 || status === 503 || status === 504) {
    return true;
  }

  return (
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT" ||
    error.code === "ECONNRESET" ||
    error.code === "EAI_AGAIN" ||
    error.code === "ENOTFOUND"
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function createWikipediaUrl(title: string): string {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`;
}

function normalizeWikipediaTitle(value: string): string {
  return value.trim().replaceAll("_", " ");
}

function normalizeSummaryExtract(extract: string): string {
  return extract
    .trim()
    .replace(/ {2,}/g, " ")
    .replace(/\s+([.,])/g, "$1");
}

function normalizeImageFilename(
  image: string | null | undefined,
): string | null {
  if (!image) {
    return null;
  }

  return /\.tiff?$/iu.test(image) ? null : image;
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const text = await readFile(filePath, "utf8");
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function filterFreshCacheEntries<T extends { fetchedAt: string }>(
  cache: Record<string, T>,
): Record<string, T> {
  return Object.fromEntries(
    Object.entries(cache).filter(([, entry]) => {
      const fetchedAtMs = Date.parse(entry.fetchedAt);
      if (Number.isNaN(fetchedAtMs)) {
        return false;
      }

      return Date.now() - fetchedAtMs < ONE_YEAR_CACHE_TTL_MS;
    }),
  );
}

async function readCache(): Promise<EnwikiMetadataCache> {
  const persistedCache =
    (await readJsonFile<EnwikiMetadataCache>(CACHE_FILE_PATH)) ?? {};
  const cache = filterFreshCacheEntries(persistedCache);

  for (const entry of Object.values(cache)) {
    if (!("image" in entry)) {
      continue;
    }

    entry.image = normalizeImageFilename(entry.image);
  }

  return cache;
}

async function writeCache(cache: EnwikiMetadataCache) {
  await mkdir(path.dirname(CACHE_FILE_PATH), { recursive: true });

  const sortedEntries = Object.entries(filterFreshCacheEntries(cache)).sort(
    ([left], [right]) => left.localeCompare(right),
  );

  await writeFile(
    CACHE_FILE_PATH,
    `${JSON.stringify(Object.fromEntries(sortedEntries), null, 2)}\n`,
    "utf8",
  );
}

async function fetchPageViews(
  wikipediaTitle: string,
  range: ReturnType<typeof getPreviousMonthRange>,
  timeoutMs: number,
  options: {
    itemNumber: number;
    itemCount: number;
    log?: ResolveLogFn;
  },
): Promise<number | null> {
  const article = encodeURIComponent(wikipediaTitle.replaceAll(" ", "_"));
  const userAgent = getWikimediaUserAgent();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const requestStartedAt = Date.now();
      const response = await fetchJson<PageViewsApiResponse>(
        `${PAGEVIEWS_API_ENDPOINT}/en.wikipedia/all-access/all-agents/${article}/monthly/${range.startTimestamp}/${range.endTimestamp}`,
        {
          headers: {
            "Api-User-Agent": userAgent,
            "User-Agent": userAgent,
          },
          timeoutMs,
          validateStatus: (status) =>
            (status >= 200 && status < 300) || status === 404,
        },
      );

      if (response.status === 404) {
        options.log?.(
          `[pageviews] ${options.itemNumber}/${options.itemCount} fetched "${wikipediaTitle}" [duration: ${Date.now() - requestStartedAt}ms] [attempt: ${attempt}] [pageViews: missing]`,
        );
        return null;
      }

      const views = response.data.items?.[0]?.views;
      options.log?.(
        `[pageviews] ${options.itemNumber}/${options.itemCount} fetched "${wikipediaTitle}" [duration: ${Date.now() - requestStartedAt}ms] [attempt: ${attempt}] [pageViews: ${formatNumber(typeof views === "number" ? views : null)}]`,
      );
      return typeof views === "number" ? views : null;
    } catch (error) {
      if (!isRetryableFetchError(error)) {
        throw error;
      }

      const status = error.status;
      if (attempt === MAX_ATTEMPTS) {
        throw error;
      }

      const retryAfterMs =
        parseRetryAfterMs(error.headers?.get("retry-after")) ??
        FALLBACK_RETRY_DELAY_MS;
      options.log?.(
        `[pageviews] ${options.itemNumber}/${options.itemCount} retrying "${wikipediaTitle}" [attempt: ${attempt}] [status: ${status ?? "error"}] [retryAfter: ${retryAfterMs}ms]`,
      );

      await sleep(retryAfterMs);
    }
  }

  throw new Error("Unreachable retry state");
}

async function fetchBatch(
  qids: string[],
  timeoutMs: number,
  options: {
    batchNumber: number;
    batchCount: number;
    log?: ResolveLogFn;
  },
): Promise<Record<string, CachedEnwikiMetadata>> {
  const userAgent = getWikimediaUserAgent();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const requestStartedAt = Date.now();
      const response = await fetchJson<WikidataEntitiesResponse>(
        WIKIDATA_API_ENDPOINT,
        {
          headers: {
            "Api-User-Agent": userAgent,
            "User-Agent": userAgent,
          },
          searchParams: {
            action: "wbgetentities",
            format: "json",
            formatversion: 2,
            ids: qids.join("|"),
            maxlag: WIKIDATA_MAX_LAG_SECONDS,
            props: "sitelinks/urls",
            sitefilter: "enwiki",
          },
          timeoutMs,
        },
      );
      options.log?.(
        `[wikidata:sitelinks] fetched batch ${options.batchNumber}/${options.batchCount} [duration: ${Date.now() - requestStartedAt}ms] [attempt: ${attempt}] [qids: ${qids.length}]`,
      );

      const maxlagState = getWikidataMaxlagState(
        response.data,
        response.headers.get("retry-after"),
        attempt,
      );
      if (maxlagState !== null) {
        if (attempt === MAX_ATTEMPTS) {
          throw new Error(maxlagState.info ?? "Wikidata maxlag");
        }

        options.log?.(
          `[wikidata:sitelinks] retrying batch ${options.batchNumber}/${options.batchCount} [attempt: ${attempt}] [status: maxlag] [retryAfter: ${maxlagState.retryAfterMs}ms] [qids: ${qids.length}]`,
        );

        await sleep(maxlagState.retryAfterMs);
        continue;
      }

      const fetchedAt = new Date().toISOString();
      const result = new Map<string, CachedEnwikiMetadata>();
      if (!response.data.entities) {
        throw new Error(
          response.data.error?.info ??
            "Wikidata sitelink response was missing entities",
        );
      }

      const entities = Array.isArray(response.data.entities)
        ? response.data.entities
        : Object.values(response.data.entities ?? {});

      for (const entity of entities) {
        if (!entity.id) {
          continue;
        }

        const title = entity.sitelinks?.enwiki?.title ?? null;
        const url = entity.sitelinks?.enwiki?.url ?? null;
        result.set(entity.id, {
          fetchedAt,
          wikipediaTitle: title,
          wikipediaUrl:
            title === null ? (url ?? null) : (url ?? createWikipediaUrl(title)),
          ...(title === null && url === null ? { image: null } : {}),
        });
      }

      return Object.fromEntries(result);
    } catch (error) {
      if (!isRetryableFetchError(error)) {
        throw error;
      }

      const maxlagState = getWikidataMaxlagState(
        error.data,
        error.headers?.get("retry-after"),
        attempt,
      );
      if (maxlagState !== null) {
        if (attempt === MAX_ATTEMPTS) {
          throw new Error(
            maxlagState.info ??
              "Waiting for Wikidata replicas to catch up (maxlag).",
            {
              cause: error,
            },
          );
        }

        options.log?.(
          `[wikidata:sitelinks] retrying batch ${options.batchNumber}/${options.batchCount} [attempt: ${attempt}] [status: maxlag] [retryAfter: ${maxlagState.retryAfterMs}ms] [qids: ${qids.length}]`,
        );

        await sleep(maxlagState.retryAfterMs);
        continue;
      }

      const status = error.status;
      if (attempt === MAX_ATTEMPTS) {
        throw error;
      }

      const retryAfterMs =
        parseRetryAfterMs(error.headers?.get("retry-after")) ??
        FALLBACK_RETRY_DELAY_MS;
      options.log?.(
        `[wikidata:sitelinks] retrying batch ${options.batchNumber}/${options.batchCount} [attempt: ${attempt}] [status: ${status ?? "error"}] [retryAfter: ${retryAfterMs}ms] [qids: ${qids.length}]`,
      );

      await sleep(retryAfterMs);
    }
  }

  throw new Error("Unreachable retry state");
}

async function fetchImagesBatch(
  titles: string[],
  timeoutMs: number,
  options: {
    batchNumber: number;
    batchCount: number;
    log?: ResolveLogFn;
  },
): Promise<Record<string, string | null>> {
  const normalizedTitles = titles.map((title) =>
    normalizeWikipediaTitle(title),
  );
  const userAgent = getWikimediaUserAgent();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const requestStartedAt = Date.now();
      const response = await fetchJson<WikipediaPageMetadataResponse>(
        WIKIPEDIA_API_ENDPOINT,
        {
          headers: {
            "Api-User-Agent": userAgent,
            "User-Agent": userAgent,
          },
          searchParams: {
            action: "query",
            format: "json",
            formatversion: 2,
            prop: "pageimages|pageprops",
            piprop: "name",
            redirects: 1,
            titles: normalizedTitles.join("|"),
          },
          timeoutMs,
        },
      );
      options.log?.(
        `[wikipedia:images] fetched batch ${options.batchNumber}/${options.batchCount} [duration: ${Date.now() - requestStartedAt}ms] [attempt: ${attempt}] [titles: ${normalizedTitles.length}]`,
      );

      const pages = response.data.query?.pages ?? [];
      const normalizedMap = new Map<string, string>();

      for (const entry of response.data.query?.normalized ?? []) {
        normalizedMap.set(entry.to, entry.from);
      }

      for (const entry of response.data.query?.redirects ?? []) {
        const requested =
          normalizedMap.get(entry.from) ?? normalizeWikipediaTitle(entry.from);
        normalizedMap.set(entry.to, requested);
      }

      const result = new Map<string, string | null>();
      for (const title of normalizedTitles) {
        result.set(title, null);
      }

      for (const page of pages) {
        if (!page.title) {
          continue;
        }

        const requestedTitle =
          normalizedMap.get(page.title) ?? normalizeWikipediaTitle(page.title);

        result.set(
          requestedTitle,
          page.missing
            ? null
            : (page.pageimage ?? page.pageprops?.page_image ?? null),
        );
      }

      return Object.fromEntries(result);
    } catch (error) {
      if (!isRetryableFetchError(error)) {
        throw error;
      }

      const status = error.status;
      if (attempt === MAX_ATTEMPTS) {
        throw error;
      }

      const retryAfterMs =
        parseRetryAfterMs(error.headers?.get("retry-after")) ??
        FALLBACK_RETRY_DELAY_MS;
      options.log?.(
        `[wikipedia:images] retrying batch ${options.batchNumber}/${options.batchCount} [attempt: ${attempt}] [status: ${status ?? "error"}] [retryAfter: ${retryAfterMs}ms] [titles: ${normalizedTitles.length}]`,
      );

      await sleep(retryAfterMs);
    }
  }

  throw new Error("Unreachable retry state");
}

async function fetchSummary(
  title: string,
  timeoutMs: number,
  options: {
    batchNumber: number;
    batchCount: number;
    itemNumber: number;
    itemCount: number;
    log?: ResolveLogFn;
  },
): Promise<string | null> {
  const normalizedTitle = normalizeWikipediaTitle(title);
  const encodedTitle = encodeURIComponent(normalizedTitle.replaceAll(" ", "_"));
  const userAgent = getWikimediaUserAgent();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await summaryRateLimiter.waitForTurn();
      const requestStartedAt = Date.now();
      const response = await fetchJson<WikipediaSummaryResponse>(
        `${WIKIPEDIA_REST_API_ENDPOINT}/page/summary/${encodedTitle}`,
        {
          headers: {
            "Api-User-Agent": userAgent,
            "User-Agent": userAgent,
          },
          timeoutMs,
          validateStatus: (status) =>
            (status >= 200 && status < 300) || status === 404,
        },
      );
      if (response.status === 404) {
        options.log?.(
          `[wikipedia:summary] ${options.itemNumber}/${options.itemCount} fetched "${normalizedTitle}" [duration: ${Date.now() - requestStartedAt}ms] [attempt: ${attempt}] [batch: ${options.batchNumber}/${options.batchCount}] [extract: missing]`,
        );
        return null;
      }

      const extract = response.data.extract
        ? normalizeSummaryExtract(response.data.extract)
        : null;
      options.log?.(
        `[wikipedia:summary] ${options.itemNumber}/${options.itemCount} fetched "${normalizedTitle}" [duration: ${Date.now() - requestStartedAt}ms] [attempt: ${attempt}] [batch: ${options.batchNumber}/${options.batchCount}] [extract: ${extract === null ? "missing" : "ok"}]`,
      );

      return extract;
    } catch (error) {
      if (!isRetryableFetchError(error)) {
        throw error;
      }

      const status = error.status;
      if (attempt === MAX_ATTEMPTS) {
        throw error;
      }

      const retryAfterMs =
        parseRetryAfterMs(error.headers?.get("retry-after")) ??
        FALLBACK_RETRY_DELAY_MS;
      options.log?.(
        `[wikipedia:summary] ${options.itemNumber}/${options.itemCount} retrying "${normalizedTitle}" [attempt: ${attempt}] [batch: ${options.batchNumber}/${options.batchCount}] [status: ${status ?? "error"}] [retryAfter: ${retryAfterMs}ms]`,
      );

      await sleep(retryAfterMs);
    }
  }

  throw new Error("Unreachable retry state");
}

export async function resolveEnwikiMetadata(
  qids: string[],
  options: ResolveEnwikiMetadataOptions = {},
): Promise<{
  metadataByQid: Record<string, CachedEnwikiMetadata>;
  stats: ResolveEnwikiMetadataStats;
}> {
  const startedAt = Date.now();
  const timeoutMs = options.timeoutMs ?? 30_000;
  const delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  const cache = await readCache();
  const result = new Map<string, CachedEnwikiMetadata>();
  const uniqueQids = Array.from(new Set(qids)).filter((qid) => qid.length > 0);
  const stats: ResolveEnwikiMetadataStats = {
    imageBatchCount: 0,
    imageCacheHits: 0,
    imageCacheMisses: 0,
    imageRequestCount: 0,
    imageTitlesRequested: 0,
    imagesResolved: 0,
    imagesResolvedAsNull: 0,
    qidsRequested: qids.length,
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
    uniqueQids: uniqueQids.length,
  };
  const missingQids = uniqueQids.filter((qid) => {
    const cacheEntry = cache[qid];
    if (!cacheEntry || cacheEntry.wikipediaTitle === null) {
      return true;
    }

    result.set(qid, cacheEntry);
    return false;
  });
  stats.sitelinkCacheHits = uniqueQids.length - missingQids.length;
  stats.sitelinkCacheMisses = missingQids.length;
  options.log?.(
    `[metadata:sitelinks] cache status [qids: ${qids.length}] [unique: ${uniqueQids.length}] [hits: ${stats.sitelinkCacheHits}] [misses: ${stats.sitelinkCacheMisses}]`,
  );

  const batches = chunk(missingQids, SITELINK_REQUEST_BATCH_SIZE);
  stats.sitelinkBatchCount = batches.length;
  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    stats.sitelinkRequestCount += 1;
    const sitelinksByQid = await fetchBatch(batch, timeoutMs, {
      batchCount: batches.length,
      batchNumber: index + 1,
      log: options.log,
    });

    for (const qid of batch) {
      const sitelink = sitelinksByQid[qid];
      if (!sitelink) {
        continue;
      }

      cache[qid] = sitelink;
      result.set(qid, sitelink);
    }
    stats.sitelinksResolved += batch.filter((qid) => {
      const entry = sitelinksByQid[qid];
      return entry?.wikipediaTitle !== null && entry?.wikipediaUrl !== null;
    }).length;

    await writeCache(cache);

    if (index < batches.length - 1) {
      await sleep(delayMs);
    }
  }

  const imageCandidates = uniqueQids
    .map((qid) => {
      const cacheEntry = cache[qid];
      if (
        !cacheEntry ||
        cacheEntry.wikipediaTitle === null ||
        cacheEntry.wikipediaUrl === null ||
        "image" in cacheEntry
      ) {
        return null;
      }

      return {
        qid,
        wikipediaTitle: cacheEntry.wikipediaTitle,
      };
    })
    .filter(
      (entry): entry is { qid: string; wikipediaTitle: string } =>
        entry !== null,
    );
  stats.imageCacheHits = uniqueQids.length - imageCandidates.length;
  stats.imageCacheMisses = imageCandidates.length;
  options.log?.(
    `[metadata:images] cache status [hits: ${stats.imageCacheHits}] [misses: ${stats.imageCacheMisses}]`,
  );

  const imageBatches = chunk(imageCandidates, IMAGE_REQUEST_BATCH_SIZE);
  stats.imageBatchCount = imageBatches.length;
  for (let index = 0; index < imageBatches.length; index += 1) {
    const batch = imageBatches[index];
    stats.imageRequestCount += 1;
    stats.imageTitlesRequested += batch.length;
    const imagesByTitle = await fetchImagesBatch(
      batch.map((entry) => entry.wikipediaTitle),
      timeoutMs,
      {
        batchCount: imageBatches.length,
        batchNumber: index + 1,
        log: options.log,
      },
    );
    const fetchedAt = new Date().toISOString();

    for (const entry of batch) {
      const cacheEntry = cache[entry.qid];
      if (!cacheEntry) {
        continue;
      }

      cacheEntry.fetchedAt = fetchedAt;
      cacheEntry.image = normalizeImageFilename(
        imagesByTitle[entry.wikipediaTitle] ?? null,
      );
      if (cacheEntry.image === null) {
        stats.imagesResolvedAsNull += 1;
      } else {
        stats.imagesResolved += 1;
      }
      result.set(entry.qid, cacheEntry);
    }

    await writeCache(cache);

    if (index < imageBatches.length - 1) {
      await sleep(delayMs);
    }
  }

  const summaryCandidates = uniqueQids
    .map((qid) => {
      const cacheEntry = cache[qid];
      if (
        !cacheEntry ||
        cacheEntry.wikipediaTitle === null ||
        cacheEntry.wikipediaUrl === null ||
        "summaryExtract" in cacheEntry
      ) {
        return null;
      }

      return {
        qid,
        wikipediaTitle: cacheEntry.wikipediaTitle,
      };
    })
    .filter(
      (entry): entry is { qid: string; wikipediaTitle: string } =>
        entry !== null,
    );
  stats.summaryCacheHits = uniqueQids.length - summaryCandidates.length;
  stats.summaryCacheMisses = summaryCandidates.length;
  options.log?.(
    `[metadata:summary] cache status [hits: ${stats.summaryCacheHits}] [misses: ${stats.summaryCacheMisses}]`,
  );

  const summaryBatches = chunk(summaryCandidates, SUMMARY_REQUEST_BATCH_SIZE);
  stats.summaryBatchCount = summaryBatches.length;
  for (let index = 0; index < summaryBatches.length; index += 1) {
    const batch = summaryBatches[index];

    for (let batchIndex = 0; batchIndex < batch.length; batchIndex += 1) {
      const entry = batch[batchIndex];
      stats.summaryRequestCount += 1;
      const summaryExtract = await fetchSummary(
        entry.wikipediaTitle,
        timeoutMs,
        {
          batchCount: summaryBatches.length,
          batchNumber: index + 1,
          itemCount: batch.length,
          itemNumber: batchIndex + 1,
          log: options.log,
        },
      );
      const cacheEntry = cache[entry.qid];
      if (!cacheEntry) {
        continue;
      }

      cacheEntry.fetchedAt = new Date().toISOString();
      cacheEntry.summaryExtract = summaryExtract;
      if (summaryExtract === null) {
        stats.summariesResolvedAsNull += 1;
      } else {
        stats.summariesResolved += 1;
      }
      result.set(entry.qid, cacheEntry);
    }

    await writeCache(cache);

    if (index < summaryBatches.length - 1) {
      await sleep(delayMs);
    }
  }

  stats.totalDurationMs = Date.now() - startedAt;
  options.log?.(
    `[metadata] resolved [uniqueQids: ${stats.uniqueQids}] [duration: ${stats.totalDurationMs}ms] [sitelinkRequests: ${stats.sitelinkRequestCount}] [imageRequests: ${stats.imageRequestCount}] [summaryRequests: ${stats.summaryRequestCount}] [imageTitlesFetched: ${stats.imageTitlesRequested}] [imagesFound: ${stats.imagesResolved}] [imageMisses: ${stats.imagesResolvedAsNull}] [summariesFound: ${stats.summariesResolved}] [summaryMisses: ${stats.summariesResolvedAsNull}]`,
  );

  return {
    metadataByQid: Object.fromEntries(result),
    stats,
  };
}

export async function resolveEnwikiPageViews(
  entries: PageViewEntryInput[],
  options: ResolveEnwikiPageViewsOptions = {},
): Promise<{
  pageViewsByQid: Record<string, number | null>;
  stats: ResolveEnwikiPageViewsStats;
}> {
  const startedAt = Date.now();
  const timeoutMs = options.timeoutMs ?? 30_000;
  const delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  const range = getPreviousMonthRange();
  const cache = await readCache();
  const uniqueEntries = Array.from(
    new Map(
      entries
        .filter(
          (entry) => entry.qid.length > 0 && entry.wikipediaTitle.length > 0,
        )
        .map((entry) => [entry.qid, entry]),
    ).values(),
  );
  const pageViewsByQid = new Map<string, number | null>();
  const missingEntries: PageViewEntryInput[] = [];
  const stats: ResolveEnwikiPageViewsStats = {
    cacheHits: 0,
    cacheMisses: 0,
    qidsRequested: entries.length,
    requestCount: 0,
    resolved: 0,
    resolvedAsNull: 0,
    targetMonth: range.month,
    totalDurationMs: 0,
    uniqueQids: uniqueEntries.length,
  };

  for (const entry of uniqueEntries) {
    const cached = cache[entry.qid];
    if (cached && "pageViews" in cached) {
      pageViewsByQid.set(entry.qid, cached.pageViews ?? null);
      stats.cacheHits += 1;
      continue;
    }

    missingEntries.push(entry);
  }

  stats.cacheMisses = missingEntries.length;
  options.log?.(
    `[pageviews] cache status [qids: ${entries.length}] [unique: ${uniqueEntries.length}] [hits: ${stats.cacheHits}] [misses: ${stats.cacheMisses}] [month: ${range.month}]`,
  );

  for (let index = 0; index < missingEntries.length; index += 1) {
    const entry = missingEntries[index];
    stats.requestCount += 1;
    const views = await fetchPageViews(entry.wikipediaTitle, range, timeoutMs, {
      itemCount: missingEntries.length,
      itemNumber: index + 1,
      log: options.log,
    });

    const existing = cache[entry.qid];
    cache[entry.qid] = {
      fetchedAt: new Date().toISOString(),
      image: existing?.image,
      pageViews: views,
      summaryExtract: existing?.summaryExtract,
      wikipediaTitle: existing?.wikipediaTitle ?? entry.wikipediaTitle,
      wikipediaUrl:
        existing?.wikipediaUrl ?? createWikipediaUrl(entry.wikipediaTitle),
    };
    pageViewsByQid.set(entry.qid, views);

    if (views === null) {
      stats.resolvedAsNull += 1;
    } else {
      stats.resolved += 1;
    }

    await writeCache(cache);

    if (index < missingEntries.length - 1) {
      await sleep(delayMs);
    }
  }

  for (const entry of uniqueEntries) {
    if (!pageViewsByQid.has(entry.qid)) {
      pageViewsByQid.set(entry.qid, null);
      stats.resolvedAsNull += 1;
    }
  }

  stats.totalDurationMs = Date.now() - startedAt;
  options.log?.(
    `[pageviews] resolved [uniqueQids: ${stats.uniqueQids}] [month: ${range.month}] [duration: ${stats.totalDurationMs}ms] [requests: ${stats.requestCount}] [found: ${stats.resolved}] [missing: ${stats.resolvedAsNull}]`,
  );

  return {
    pageViewsByQid: Object.fromEntries(pageViewsByQid),
    stats,
  };
}
