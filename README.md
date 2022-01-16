# Wiki Trivia

This is the source code for the web app at https://wikitrivia.tomjwatson.com.

The repository for the scraper can be found [here](https://github.com/tom-james-watson/wikitrivia-scraper).

## Usage

### Prerequisites

```bash
npm install
```

### Development

```bash
npm run dev
```

Then visit http://localhost:3000/ to preview the website.

### Static build

To build a static version of the website to the `out` folder, run:

```bash
npm run build
```

Then run said build with:

```bash
npm start
```

## FAQ

### Where does the data come from?

The data is all sourced from [wikidata](https://www.wikidata.org).

### I was played a card that doesn't make sense - what gives?

There are some cards that unfortunately don't quite make sense or have bad data. These need to be removed from the game and, ideally, to have their underlying wikidata entry fixed.

Please report any bad cards here: https://github.com/tom-james-watson/wikitrivia/discussions/2.
