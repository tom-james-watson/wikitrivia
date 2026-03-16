# Content Tooling

Wikitrivia decks are generated from checked-in Wikidata Query Service results.

Each source query lives in `content/queries/<query-id>/` with:

- `query.ts`: typed card/deck metadata
- `query.rq`: the SPARQL query
- `rows.json`: the saved result snapshot

The deck tree is composed in `content/deck-tree.ts`.

## Commands

List query ids:

```bash
bun run sparql:list
```

Refresh one query snapshot:

```bash
bun run sparql:run -- --query films-release-year
```

Refresh all query snapshots:

```bash
bun run sparql:run
```

Build deck JSON from saved rows:

```bash
bun run decks:build
```

Scripts that contact Wikimedia APIs require a local `.env`. From the repo root:

```bash
cp .env.example .env
```

Fill in `WIKITRIVIA_CONTACT_EMAIL` before running API-backed commands. The user-agent name is derived from the GitHub `origin` remote, for example `tom-james-watson/wikitrivia`.
