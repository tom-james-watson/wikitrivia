import { getWikimediaUserAgent } from "../api-env";
import { FetchRequestError, fetchJson } from "../fetch";

export type SparqlBinding = {
  datatype?: string;
  type: string;
  value: string;
};

export type SparqlResults = {
  bindings: Record<string, SparqlBinding>[];
};

export type SparqlResponse = {
  head: {
    vars: string[];
  };
  results: SparqlResults;
};

const WDQS_ENDPOINT = "https://query.wikidata.org/sparql";
const ACCEPT_HEADER = "application/sparql-results+json";
const MAX_ATTEMPTS = 3;
const FALLBACK_RETRY_DELAY_MS = 5_000;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const RETRYABLE_ERROR_CODES = new Set([
  "ECONNABORTED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ERR_NETWORK",
]);

export type RunSparqlQueryOptions = {
  timeoutMs: number;
};

export class SparqlRequestError extends Error {
  status?: number;
  responseBody?: string;

  constructor(
    message: string,
    options?: { responseBody?: string; status?: number },
  ) {
    super(message);
    this.name = "SparqlRequestError";
    this.responseBody = options?.responseBody;
    this.status = options?.status;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

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

export async function runSparqlQuery(
  query: string,
  options: RunSparqlQueryOptions,
): Promise<SparqlResponse> {
  const userAgent = getWikimediaUserAgent();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchJson<SparqlResponse>(WDQS_ENDPOINT, {
        body: new URLSearchParams({
          format: "json",
          query,
        }).toString(),
        headers: {
          Accept: ACCEPT_HEADER,
          "Api-User-Agent": userAgent,
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": userAgent,
        },
        method: "POST",
        timeoutMs: options.timeoutMs,
      });

      return response.data;
    } catch (error) {
      if (!(error instanceof FetchRequestError)) {
        throw error;
      }

      const status = error.status;
      const shouldRetry =
        (typeof status === "number" && RETRYABLE_STATUS_CODES.has(status)) ||
        (typeof error.code === "string" &&
          RETRYABLE_ERROR_CODES.has(error.code));
      if (!shouldRetry || attempt === MAX_ATTEMPTS) {
        throw new SparqlRequestError(error.message, {
          responseBody: error.responseBody,
          status,
        });
      }

      const retryAfterMs =
        parseRetryAfterMs(error.headers?.get("retry-after") ?? null) ??
        FALLBACK_RETRY_DELAY_MS * attempt;

      await sleep(retryAfterMs);
    }
  }

  throw new Error("Unreachable retry state");
}
