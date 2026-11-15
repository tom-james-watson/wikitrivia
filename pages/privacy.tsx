import AppHead from "../components/app-head";
import PageShell from "../components/page-shell";
import * as styles from "../styles/privacy.css";

export default function PrivacyPage() {
  return (
    <>
      <AppHead title="Privacy | Wikitrivia" />
      <PageShell>
        <div className={styles.content}>
          <section className={styles.section}>
            <h1 className={styles.heading}>Privacy</h1>
            <p className={styles.text}>
              This site is operated by Tom James Watson. Contact:{" "}
              <a href="mailto:privacy@tomjwatson.com">privacy@tomjwatson.com</a>
              .
            </p>
            <p className={styles.text}>
              Browser storage saves your progress and preferences and, in some
              regions, usage history to measure return visits. Do Not Track and
              Global Privacy Control disable usage-history storage. Clear site
              data to remove stored information.
            </p>
            <p className={styles.text}>
              We process technical and usage data to operate, secure and improve
              the site, relying on legitimate interests. Analytics records
              exclude IP addresses and unique identifiers and are kept for three
              months; page-view statistics remain available for six months. We
              do not sell personal data or use advertising trackers.
            </p>
            <p className={styles.text}>
              Hosting, analytics and content providers receive IP addresses and
              request details. Their privacy terms govern retention and
              international processing, including applicable{" "}
              <a href="https://www.cloudflare.com/cloudflare-customer-dpa/">
                transfer safeguards
              </a>
              .
            </p>
            <p className={styles.text}>
              Where applicable, contact us to request access, correction,
              deletion or restriction of personal data. You may complain to your
              local data protection authority.
            </p>
            <p className={styles.text}>
              You may object to processing based on legitimate interests.
            </p>
          </section>
        </div>
      </PageShell>
    </>
  );
}
