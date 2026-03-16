import AppHead from "../components/app-head";
import ButtonLink from "../components/button-link";
import SiteHeader from "../components/site-header";
import * as dailyStyles from "../styles/daily-entry-screen.css";
import * as layoutStyles from "../styles/game-route-screen.css";

export default function NotFoundPage() {
  return (
    <>
      <AppHead title="Page Not Found | Wikitrivia" />
      <div className={layoutStyles.page}>
        <SiteHeader />
        <div className={layoutStyles.boardFrame}>
          <main className={dailyStyles.screen}>
            <div className={dailyStyles.stage}>
              <div className={dailyStyles.content}>
                <div className={dailyStyles.dailyLabel}>
                  404 / Page Not Found
                </div>
                <ButtonLink fullWidth href="/" text="Return Home" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
