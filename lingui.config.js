/** @type {import('@lingui/conf').LinguiConfig} */
export const locales = ["en", "fr"];
export const sourceLocale = "en";
export const catalogs = [
  {
    path: "<rootDir>/locales/{locale}/messages",
    include: ["components"],
  },
];
export const format = "po";