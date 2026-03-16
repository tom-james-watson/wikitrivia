import Link from "next/link";
import * as styles from "../styles/site-header.css";

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link aria-label="Wikitrivia home" className={styles.wordmark} href="/">
          Wikitrivia
        </Link>
      </div>
    </header>
  );
}
