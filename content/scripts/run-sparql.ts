import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { LoadedQueryDefinition } from "../query-definition";
import { loadQueryDefinitions } from "../query-definitions";
import {
  runSparqlQuery,
  SparqlBinding,
  SparqlRequestError,
} from "../sparql/client";

const DEFAULT_DELAY_MS = 2_000;
const DEFAULT_TIMEOUT_MS = 120_000;

type CliArgs = {
  listOnly: boolean;
  queryIds: string[];
  timeoutMs: number;
};

type SnapshotResult = {
  durationMs: number;
  error?: string;
  outputDir: string;
  resultCount?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function formatDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  return `${(durationMs / 1000).toFixed(2)}s`;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    listOnly: false,
    queryIds: [],
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--list") {
      args.listOnly = true;
      continue;
    }

    if (arg === "--query") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--query requires a query id");
      }

      args.queryIds.push(value);
      index += 1;
      continue;
    }

    if (arg === "--timeout-ms") {
      const value = Number(argv[index + 1]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("--timeout-ms requires a positive number");
      }

      args.timeoutMs = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function pickQueries(
  queries: LoadedQueryDefinition[],
  queryIds: string[],
): LoadedQueryDefinition[] {
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

function flattenBinding(
  binding: Record<string, SparqlBinding>,
  variables: string[],
): Record<string, string> {
  const row: Record<string, string> = {};
  for (const variable of variables) {
    row[variable] = binding[variable]?.value ?? "";
  }

  return row;
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function snapshotQuery(
  query: LoadedQueryDefinition,
  timeoutMs: number,
): Promise<SnapshotResult> {
  const queryOutputDir = query.dirPath;
  await mkdir(queryOutputDir, { recursive: true });

  const startedAt = Date.now();
  try {
    const result = await runSparqlQuery(query.query, { timeoutMs });
    const durationMs = Date.now() - startedAt;
    const rows = result.results.bindings.map((binding) =>
      flattenBinding(binding, result.head.vars),
    );

    await writeJson(path.join(queryOutputDir, "rows.json"), rows);

    return {
      durationMs,
      outputDir: queryOutputDir,
      resultCount: rows.length,
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const messageLines =
      error instanceof Error ? [error.stack ?? error.message] : [String(error)];

    if (error instanceof SparqlRequestError) {
      if (typeof error.status === "number") {
        messageLines.push("", `HTTP status: ${error.status}`);
      }

      if (error.responseBody) {
        messageLines.push("", "Response body:", error.responseBody);
      }
    }

    return {
      durationMs,
      error: messageLines.join("\n"),
      outputDir: queryOutputDir,
    };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const allQueries = await loadQueryDefinitions();

  if (args.listOnly) {
    for (const query of allQueries) {
      console.log(`${query.id}\t${query.title}`);
    }
    return;
  }

  const selectedQueries = pickQueries(allQueries, args.queryIds);
  let hadErrors = false;

  for (let index = 0; index < selectedQueries.length; index += 1) {
    const query = selectedQueries[index];
    if (index > 0) {
      await sleep(DEFAULT_DELAY_MS);
    }

    console.log(`[${index + 1}/${selectedQueries.length}] ${query.id}`);
    const entry = await snapshotQuery(query, args.timeoutMs);
    if (entry.error) {
      hadErrors = true;
      console.log(
        `  failed after ${formatDuration(entry.durationMs)} for ${entry.outputDir}`,
      );
    } else {
      console.log(
        `  saved ${entry.resultCount} row(s) to ${entry.outputDir} in ${formatDuration(entry.durationMs)}`,
      );
    }
  }

  if (hadErrors) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error(message);
  process.exitCode = 1;
});
