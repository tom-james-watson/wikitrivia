import * as styles from "../styles/loading.css";

export default function Loading() {
  return (
    <div className={styles.loading}>
      <div className={styles.loadingInner}>
        <div className={styles.eyebrow}>Loading</div>
        <div
          aria-label="Loading game data"
          aria-valuetext="Loading game data"
          className={styles.timelineTrack}
          role="progressbar"
        >
          <div className={styles.timelineSweep} />
        </div>
      </div>
    </div>
  );
}
