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
          </div>
          <SiteFooter className={styles.footer} />
        </div>
      </div>
    </PageShell>
  );
}
