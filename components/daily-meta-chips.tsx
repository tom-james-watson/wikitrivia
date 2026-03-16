export { DAILY_DATE_LOCALE, formatDailyDate } from "../lib/daily-format";
import * as styles from "../styles/daily-meta-chips.css";

interface DailyMetaChipsProps {
  dateLabel: string;
  nextLabel: string;
}

export default function DailyMetaChips(props: DailyMetaChipsProps) {
  const { dateLabel, nextLabel } = props;

  return (
    <div className={styles.row}>
      <div className={styles.chip}>{dateLabel}</div>
      <div className={styles.chip}>{nextLabel}</div>
    </div>
  );
}
