# Wikitrivia

Wikitrivia is a year-based timeline trivia game built from Wikimedia data.

The live app is at [wikitrivia.tomjwatson.com](https://wikitrivia.tomjwatson.com).

## Setup

Install dependencies with Bun:

```bash
bun install
```

Create a local env file before running scripts that contact Wikimedia APIs:

```bash
cp .env.example .env
```

Then edit `.env` and set `WIKITRIVIA_CONTACT_EMAIL` to your email address. This will be used in API requests to identify yourself to Wikimedia.

## Development

Run the app locally:

```bash
bun run dev
```

Then visit [localhost:3000](http://localhost:3000).

Build the static site:

```bash
bun run build
```

Serve the built `out/` directory:

```bash
bun run start
```

Useful checks:

```bash
bun run typecheck
bun run lint
bun run format:check
```

## Content

Game content comes from Wikidata Query Service snapshots in `content/queries/` and is built into deck JSON under `public/decks/`.

For the content tooling, see [content/README.md](content/README.md).

## FAQ

### Where does the data come from?

The data is sourced from [Wikidata](https://www.wikidata.org) and [Wikipedia](https://wikipedia.org).

### I found a card with incorrect data. What should I do?

If the underlying Wikidata item is wrong, fix it directly on Wikidata. It will then get synced back into the game the next time the decks are updated.
