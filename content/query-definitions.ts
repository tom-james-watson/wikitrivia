import { access, readFile, readdir } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import {
  inferMinScoreFromQuery,
  LoadedQueryDefinition,
  QueryDefinition,
} from "./query-definition";

const CONTENT_QUERIES_ROOT = "content/queries";
const QUERY_DEFINITION_FILE = "query.ts";

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findQueryDefinitionPaths(rootDir: string): Promise<string[]> {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const queryDefinitionPaths: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      queryDefinitionPaths.push(...(await findQueryDefinitionPaths(entryPath)));
      continue;
    }

    if (entry.isFile() && entry.name === QUERY_DEFINITION_FILE) {
      queryDefinitionPaths.push(entryPath);
    }
  }

  return queryDefinitionPaths.sort();
}

export async function loadQueryDefinitions(): Promise<LoadedQueryDefinition[]> {
  const definitionPaths = await findQueryDefinitionPaths(CONTENT_QUERIES_ROOT);
  const queries = await Promise.all(
    definitionPaths.map(async (definitionPath) => {
      const moduleUrl = pathToFileURL(path.resolve(definitionPath)).href;
      const importedQuery = (await import(moduleUrl)) as {
        default: QueryDefinition;
      };
      const dirPath = path.dirname(definitionPath);
      const queryFilePath = path.join(dirPath, "query.rq");

      if (!(await exists(queryFilePath))) {
        throw new Error(`Missing query.rq alongside ${definitionPath}`);
      }

      const queryText = (await readFile(queryFilePath, "utf8")).trim();
      const query = importedQuery.default;

      return {
        ...query,
        minScore: query.minScore || inferMinScoreFromQuery(queryText) || 0,
        query: queryText,
      };
    }),
  );

  const seenIds = new Set<string>();
  for (const query of queries) {
    if (seenIds.has(query.id)) {
      throw new Error(`Duplicate query id: ${query.id}`);
    }

    seenIds.add(query.id);
  }

  return queries.sort((left, right) => left.id.localeCompare(right.id));
}
