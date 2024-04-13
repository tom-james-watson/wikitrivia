import React from "react";
import Head from "next/head";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { messages as enMessages } from "../locales/en/messages";
import { messages as frMessages } from "../locales/fr/messages";
import Game from "./game";

export default function App() {
  i18n.load({
    en: enMessages,
    fr: frMessages,
  });
  i18n.activate(navigator.language);

  return <I18nProvider i18n={i18n}>
    <Head>
      <title>disCO2very - Discover their CO2 footprint by ordering items</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
    </Head>
    <Game />
  </I18nProvider>
}