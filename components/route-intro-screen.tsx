import classNames from "classnames";
import React from "react";
import { formatTimeUntilNextDaily, getCurrentUtcDateKey } from "../lib/daily";
import { GameDifficulty } from "../types/game";
import { GameMode, SelectionRoute } from "../types/routes";
import DailyMetaChips, {
  DAILY_DATE_LOCALE,
  formatDailyDate,
} from "./daily-meta-chips";
import DifficultySelector from "./difficulty-selector";
import SiteHeader from "./site-header";
import * as buttonStyles from "../styles/button.css";
import * as styles from "../styles/route-intro-screen.css";

interface Props {
  availableDifficulties?: GameDifficulty[];
  dailyDateKey?: string;
  difficulty: GameDifficulty;
  embedded?: boolean;
  mode: GameMode;
  onStart: () => void;
  selectionRoute?: SelectionRoute;
  setDifficulty?: (difficulty: GameDifficulty) => void;
  showHeader?: boolean;
}

export default function RouteIntroScreen(props: Props) {
  const {
    dailyDateKey,
    availableDifficulties,
    difficulty,
    embedded = false,
    mode,
    onStart,
    setDifficulty,
    showHeader = true,
  } = props;
  const showDifficulty =
    mode === "free-play" && typeof setDifficulty === "function";
  const resolvedDailyDateKey = dailyDateKey ?? getCurrentUtcDateKey();
  const introCopy = "Place the cards on the timeline in the correct order.";
  const [nextDailyText, setNextDailyText] = React.useState(() =>
    formatTimeUntilNextDaily(new Date(), "Next in"),
  );
  const formattedDailyDate = React.useMemo(() => {
    return formatDailyDate(resolvedDailyDateKey, DAILY_DATE_LOCALE);
  }, [resolvedDailyDateKey]);

  React.useEffect(() => {
    if (mode !== "daily") {
      return;
    }

    const updateNextDailyText = () => {
      setNextDailyText(formatTimeUntilNextDaily(new Date(), "Next in"));
    };

    updateNextDailyText();
    const intervalId = window.setInterval(updateNextDailyText, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [mode]);

  return (
    <>
      {showHeader ? <SiteHeader /> : null}
      <div
        className={classNames(styles.screen, {
          [styles.embeddedScreen]: embedded,
        })}
      >
        <div className={styles.stage}>
          {mode === "daily" && showHeader ? (
            <div className={styles.sectionTitle}>Daily</div>
          ) : null}

          <div className={styles.content}>
            {showDifficulty ? (
              <DifficultySelector
                availableDifficulties={availableDifficulties}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
              />
            ) : (
              <DailyMetaChips
                dateLabel={formattedDailyDate}
                nextLabel={nextDailyText}
              />
            )}
            <p className={styles.introCopy}>{introCopy}</p>
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
        </div>
      </div>
    </>
  );
}
