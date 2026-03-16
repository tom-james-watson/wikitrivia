import { Head, Html, Main, NextScript } from "next/document";
import { appThemeClass } from "../styles/theme.css";

export default function Document() {
  return (
    <Html className={appThemeClass}>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
