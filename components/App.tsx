import React from "react";
import Head from "next/head";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import {messages as enMessages} from "../locales/en/messages";
import {messages as frMessages} from "../locales/fr/messages";
import { t } from "@lingui/macro";
import Game from "./game";

export const locales = ["en", "fr"];
export const defaultLocale = "en";

export default function App() {
  const lang = navigator.language.substring(0,2);
  const locale = locales.includes(lang) ? lang : defaultLocale;
  i18n.load(locale, locale === "en" ? enMessages : frMessages);
  i18n.activate(locale);

  return <I18nProvider i18n={i18n}>
    <Head>
      <title>disCO2very - {t`Order items to discover their CO2 footprint!`}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <meta name="description" content="disCO2very is a free game introducing you to the orders of magnitude of the CO2 footprint" />
      <meta name="theme-color" content="#23272c" />
      <meta property="og:url" content="https://disco2very.org" />
      <meta property="og:title" content="disCO2very" />
      <meta property="og:site_name" content="disCO2very" />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={locale} />
      <meta property="og:description" content="disCO2very is a free game introducing you to the orders of magnitude of the CO2 footprint" />
    </Head>
    <Game />
  </I18nProvider>
}