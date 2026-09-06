import Image from "next/image";
import ButtonLink from "./button-link";
import PageShell from "./page-shell";
import SiteFooter from "./site-footer";
import SiteHero from "./site-hero";
import * as styles from "../styles/home-screen.css";

export default function HomeScreen() {
  return (
    <PageShell showHeader={false}>
      <div className={styles.home}>
        <div className={styles.wrapper}>
          <div className={styles.stage}>
            <SiteHero subtitle="Put the world's knowledge in chronological order." />
            <div className={styles.actions}>
              <ButtonLink fullWidth href="/daily" text="Daily" />
              <ButtonLink fullWidth href="/play" minimal text="Free play" />
            </div>
            <div className={styles.otherGames}>
              <a
                className={styles.gameLink}
                href="https://timeframe.tomjwatson.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Image
                  alt=""
                  aria-hidden="true"
                  className={styles.gameIcon}
                  height={20}
                  src="/timeframe-favicon.svg"
                  width={20}
                />
                <span>Try Timeframe, my new daily art game.</span>
              </a>
              <a
                className={styles.gameLink}
                href="https://pinstinct.tomjwatson.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Image
                  alt=""
                  aria-hidden="true"
                  className={styles.gameIcon}
                  height={20}
                  src="/pinstinct-favicon.svg"
                  width={20}
                />
                <span>Try Pinstinct, my daily map game.</span>
              </a>
            </div>
          </div>
          <SiteFooter className={styles.footer} />
        </div>
      </div>
    </PageShell>
  );
}
