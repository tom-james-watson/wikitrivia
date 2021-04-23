import { AppProps } from "next/app";
import "../styles/globals.scss";
import "../components/WhyDidYouReload";

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;
