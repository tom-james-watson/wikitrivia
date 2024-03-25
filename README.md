# disCO<sub>2</sub>very

A free software game to discover the orders of magnitude of the CO<sub>2</sub> footprint in our daily life and raise awareness about climate change.

*This application is based on the work done by Thomas James Watson (thank you! ❤️) for [wikitrivia](https://wikitrivia.tomjwatson.com). Original source code [on github](https://github.com/tom-james-watson/wikitrivia-scraper).*

## About

This project is using the open data provided by ADEME (*Agence de l'environnement et de la maîtrise de l'énergie*, the french State agency working on climate change). Raw data are avaible on ADEME website, with a [nice website for users](https://impactco2.fr), or through [an API](https://impactco2.fr/api-doc).

This is the early beginning of the project and it has several limitations at the moment:
- It is only available in french, as that's the only language in which ADEME is providing the information. We plan to discuss with them to see if they can provide at least english as well.
- It is using the french CO<sub>2</sub> data based on France characteristics. The biggest difference with other countries is a very low carbon footprint for electricy consumption as France has mainly low carbon electrical plants. The CO<sub>2</sub> number would be very different in other countries like those using coal power plants for example.
- It is ugly and buggy at the moment 😅 but we hope to improve this in the short term 🥳

## Contributions

Every contribution to the project is welcome! By contributing, you accept that your work is going to be placed under the AGPL licence (see the LICENSE file).

## Technical informations

This project is using the [NextJS](https://nextjs.org/) framework, itself based on ReactJS.
NodeJS 18.17.0 or higher is required to build and run the project.

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

To build a static version of the website to the `out` folder, that you can then deploy anywhere (it's plain HTML + JS, no server needed) run:

```bash
npm run build
```
