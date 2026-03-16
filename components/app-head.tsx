import Head from "next/head";

interface Props {
  title?: string;
}

export default function AppHead(props: Props) {
  const { title = "Wikitrivia" } = props;

  return (
    <Head>
      <title>{title}</title>
      <link
        rel="preload"
        href="/fonts/inter-latin.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/fonts/fraunces-latin.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml" />
      <link
        rel="icon"
        href="/favicon-light.png"
        media="(prefers-color-scheme: light)"
        type="image/png"
      />
      <link
        rel="icon"
        href="/favicon-dark.png"
        media="(prefers-color-scheme: dark)"
        type="image/png"
      />
      <link rel="icon" href="/favicon-light.png" type="image/png" />
    </Head>
  );
}
