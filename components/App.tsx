import React, { useEffect } from "react";
import Head from "next/head";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { t } from "@lingui/macro";
import Game from "./game";

export const locales = ["en", "fr"];
export const defaultLocale = "en";

/**
 * We do a dynamic import of just the catalog that we need
 * @param locale any locale string
 */
export async function dynamicActivate(locale: string) {
  const { messages } = await import(`../locales/${locale}/messages`);
  i18n.load(locale, messages);
  i18n.activate(locale);
}

export default function App() {
  useEffect(() => {
    const lang = navigator.language.substring(0,2);
    // With this method we dynamically load the catalogs
    dynamicActivate(locales.includes(lang) ? lang : defaultLocale);
  }, []);

  return <I18nProvider i18n={i18n}>
    <Head>
      <title>disCO2very - {t`Discover the CO2 footprint of actions or objects by ordering them`}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
    </Head>
    <Game />
  </I18nProvider>
}