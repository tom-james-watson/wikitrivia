import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";

const App = dynamic(() => import("../components/app"), { ssr: false });

export default function Index() {
  return <>
    <Head>
      <title>disCO2very - Order items to discover their CO2 footprint!</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <meta name="description" content="disCO2very is a free game to discover the orders of magnitude of the CO2 footprint" />
      <meta name="theme-color" content="#23272c" />
      <meta property="og:url" content="https://disco2very.org" />
      <meta property="og:title" content="disCO2very" />
      <meta property="og:site_name" content="disCO2very" />
      <meta property="og:type" content="website" />
      <meta property="og:description" content="disCO2very is a free game to discover the orders of magnitude of the CO2 footprint" />
      <meta property="og:image" content="https://disco2very.org/images/logo-app.png" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:height" content="192" />
      <meta property="og:image:width" content="192" />
      <meta property="og:image:alt" content="The disCO2very logo, featuring a molecule of CO2." />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="Fla" />
      <link rel="icon" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/images/logo-app.png" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="canonical" href="https://www.disco2very.org/" />
    </Head>
    <App />
  </>
}
