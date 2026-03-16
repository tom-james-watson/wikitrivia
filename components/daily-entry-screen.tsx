import classNames from "classnames";
import React from "react";
import { DAILY_DIFFICULTY, formatTimeUntilNextDaily } from "../lib/daily";
import { buildShareText } from "../lib/share";
import DailyCompletedSummary from "./daily-completed-summary";
import { DAILY_DATE_LOCALE, formatDailyDate } from "./daily-meta-chips";
import PageShell from "./page-shell";
import * as buttonStyles from "../styles/button.css";
import * as styles from "../styles/daily-entry-screen.css";

interface Props {
  completedResults?: boolean[] | null;
  completedScore?: number | null;
  dailyDateKey: string;
  embedded?: boolean;
  onStart: () => void;
}

const defaultShareText = "Share";

export default function DailyEntryScreen(props: Props) {
  const {
    completedResults = null,
    completedScore = null,
    dailyDateKey,
    embedded = false,
    onStart,
  } = props;
  const [nextDailyText, setNextDailyText] = React.useState(() =>
    formatTimeUntilNextDaily(new Date()),
  );
  const [shareText, setShareText] = React.useState(defaultShareText);
  const formattedDailyDate = React.useMemo(() => {
    return formatDailyDate(dailyDateKey, DAILY_DATE_LOCALE);
  }, [dailyDateKey]);

  React.useEffect(() => {
    const updateNextDailyText = () => {
      setNextDailyText(formatTimeUntilNextDaily(new Date()));
    };

    updateNextDailyText();
    const intervalId = window.setInterval(updateNextDailyText, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const share = React.useCallback(async () => {
    if (completedScore === null) {
      return;
    }

    await navigator?.clipboard?.writeText(
      buildShareText({
        dateKey: dailyDateKey,
        difficulty: DAILY_DIFFICULTY,
        mode: "daily",
        path: "/daily",
        results: completedResults ?? undefined,
        score: completedScore,
      }),
    );
    setShareText("Copied");
    window.setTimeout(() => {
      setShareText(defaultShareText);
    }, 2000);
  }, [completedResults, completedScore, dailyDateKey]);

  const content = (
    <div className={styles.screen}>
      <div className={styles.stage}>
        {completedScore === null ? (
          <div className={styles.content}>
            <div
              className={styles.dailyLabel}
            >{`Daily / ${formattedDailyDate}`}</div>
            <button
              className={classNames(
                buttonStyles.button,
                buttonStyles.fullWidth,
              )}
              onClick={onStart}
              type="button"
            >
              Start
            </button>
          </div>
        ) : (
          <DailyCompletedSummary
            dailyLabel={`Daily / ${formattedDailyDate}`}
            nextDailyText={nextDailyText}
            onShare={share}
            score={completedScore}
            shareText={shareText}
          />
        )}
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return <PageShell>{content}</PageShell>;
}
