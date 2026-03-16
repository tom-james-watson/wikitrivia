import { motion } from "motion/react";
import React from "react";
import { formatTimeUntilNextDaily } from "../lib/daily";
import { buildShareText, getShareResults } from "../lib/share";
import { PlayedCard } from "../types/cards";
import { GameDifficulty } from "../types/game";
import { GameMode, SelectionRoute } from "../types/routes";
import Button from "./button";
import DailyCompletedSummary from "./daily-completed-summary";
import { DAILY_DATE_LOCALE, formatDailyDate } from "./daily-meta-chips";
import FreePlayBreadcrumbs from "./free-play-breadcrumbs";
import Score from "./score";
import * as styles from "../styles/game-over.css";

interface Props {
  dailyDateKey?: string;
  difficulty: GameDifficulty;
  gameMode: GameMode;
  highscore: number;
  played: PlayedCard[];
  resetGame?: () => void;
  routePath: string;
  score: number;
  selectionRoute?: SelectionRoute;
}

const defaultShareText = "Share";

export default function GameOver(props: Props) {
  const {
    dailyDateKey,
    difficulty,
    gameMode,
    highscore,
    played,
    resetGame,
    routePath,
    score,
    selectionRoute,
  } = props;

  const [shareText, setShareText] = React.useState(defaultShareText);
  const [nextDailyText, setNextDailyText] = React.useState(() =>
    formatTimeUntilNextDaily(new Date(), "Next in"),
  );
  const formattedDailyDate = React.useMemo(() => {
    if (!dailyDateKey) {
      return "";
    }

    return formatDailyDate(dailyDateKey, DAILY_DATE_LOCALE);
  }, [dailyDateKey]);

  React.useEffect(() => {
    if (gameMode !== "daily") {
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
  }, [gameMode]);

  const share = React.useCallback(async () => {
    await navigator?.clipboard?.writeText(
      buildShareText({
        dateKey: dailyDateKey,
        difficulty,
        highscore: gameMode === "free-play" ? highscore : undefined,
        mode: gameMode,
        path: routePath,
        results: getShareResults(played),
        score,
        selectionRoute,
      }),
    );
    setShareText("Copied");
    setTimeout(() => {
      setShareText(defaultShareText);
    }, 2000);
  }, [
    dailyDateKey,
    difficulty,
    gameMode,
    highscore,
    played,
    routePath,
    score,
    selectionRoute,
  ]);

  if (gameMode === "daily" && dailyDateKey) {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        className={styles.gameOver}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <motion.div
          animate={{ opacity: 1 }}
          className={styles.dailySummary}
          initial={{ opacity: 0 }}
          transition={{ delay: 0.14, duration: 0.28, ease: "easeOut" }}
        >
          <DailyCompletedSummary
            dailyLabel={`Daily / ${formattedDailyDate}`}
            nextDailyText={nextDailyText}
            onShare={share}
            score={score}
            shareText={shareText}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={styles.gameOver}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <motion.div
        animate={{ opacity: 1 }}
        className={styles.freePlaySummary}
        initial={{ opacity: 0 }}
        transition={{ delay: 0.14, duration: 0.28, ease: "easeOut" }}
      >
        <div className={styles.summaryStack}>
          {selectionRoute ? (
            <FreePlayBreadcrumbs selectionRoute={selectionRoute} />
          ) : null}
          <div className={styles.scoresWrapper}>
            <Score score={score} title="Score" />
            <Score score={highscore} title="Best" />
          </div>
          <div className={styles.buttons}>
            {resetGame ? (
              <Button fullWidth onClick={resetGame} text="Play again" />
            ) : null}
            <Button
              fullWidth
              onClick={share}
              text={shareText}
              minimal={!!resetGame}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
