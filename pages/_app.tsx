import React from "react";
import { AppProps } from "next/app";
import { polyfill } from "seamless-scroll-polyfill";
import "../styles/globals.scss";

function App({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    polyfill();
  }, []);

  return <Component {...pageProps} />;
}

export default App;
