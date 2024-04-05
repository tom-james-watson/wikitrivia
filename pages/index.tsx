import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

const Game = dynamic(() => import("../components/game"), { ssr: false });

export default function Index() {
  return (
    <>
      <Head>
        <title>disCO2very - Discover their CO2 footprint by ordering items</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
      </Head>
      <Game />
    </>
  );
}
