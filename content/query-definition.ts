export type SourceRow = Record<string, string>;

export type CardTextResolver<Row extends SourceRow = SourceRow> =
  | string
  | ((row: Row) => string | null | undefined);

export type CardTemplatePreset<Row extends SourceRow = SourceRow> = {
  maxSubtitleLength?: number;
  maxTitleLength?: number;
  subtitleTemplate?: CardTextResolver<Row> | null;
  titleTemplate: CardTextResolver<Row>;
};

export type QueryDefinition<Row extends SourceRow = SourceRow> = {
  cards: CardTemplatePreset<Row>;
  dirPath: string;
  id: string;
  minScore: number;
  title: string;
};

export type LoadedQueryDefinition<Row extends SourceRow = SourceRow> =
  QueryDefinition<Row> & {
    query: string;
  };

type QueryRegistrationInput<Row extends SourceRow = SourceRow> = {
  cards: CardTemplatePreset<Row>;
  dirPath: string;
  id: string;
  minScore?: number;
  title: string;
};

function assertNonNegativeInteger(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid ${label}: expected a non-negative integer`);
  }
}

export function inferMinScoreFromQuery(query: string): number | null {
  const match = query.match(
    /FILTER\s*\(\s*\?(?:sitelinks|siteLinks)\s*>=\s*(\d+)\s*\)/i,
  );
  if (!match) {
    return null;
  }

  return Number(match[1]);
}

function normalizeQuery<Row extends SourceRow>(
  query: QueryRegistrationInput<Row>,
): QueryDefinition<Row> {
  const minScore = query.minScore ?? 0;
  assertNonNegativeInteger(minScore, `${query.id} minScore`);

  return {
    ...query,
    minScore,
  };
}

export function defineQuery(input: QueryRegistrationInput): QueryDefinition;
export function defineQuery<Row extends SourceRow>(
  input: QueryRegistrationInput<Row>,
): QueryDefinition<Row>;
export function defineQuery<Row extends SourceRow>(
  input: QueryRegistrationInput<Row>,
): QueryDefinition<Row> {
  return normalizeQuery(input);
}
