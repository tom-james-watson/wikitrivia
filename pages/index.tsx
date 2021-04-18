import Head from "next/head";
import Game from "./components/game";

export default function Index() {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Game />
      </main>

      <footer></footer>
    </div>
  );
}
