import React from "react";
import AppHead from "../components/app-head";
import DailyEntryScreen from "../components/daily-entry-screen";
import GameRouteScreen from "../components/game-route-screen";
import { getCurrentUtcDateKey } from "../lib/daily";
import { loadDailyGameSnapshot } from "../lib/daily-storage";
import { getShareResults } from "../lib/share";

export default function DailyPage() {
  const [started, setStarted] = React.useState(false);
  const [completedResults, setCompletedResults] = React.useState<
    boolean[] | null
  >(null);
  const [completedScore, setCompletedScore] = React.useState<null | number>(
    null,
  );
  const dateKey = React.useMemo(() => getCurrentUtcDateKey(), []);

  React.useEffect(() => {
    const snapshot = loadDailyGameSnapshot();

    if (!snapshot || snapshot.dateKey !== dateKey || snapshot.lives > 0) {
      setCompletedResults(null);
      setCompletedScore(null);
      return;
    }

    setCompletedResults(getShareResults(snapshot.played));
    setCompletedScore(
      snapshot.played.filter((item) => item.played.correct).length - 1,
    );
  }, [dateKey]);

  if (!started || completedScore !== null) {
    return (
      <>
        <AppHead title="Daily | Wikitrivia" />
        <DailyEntryScreen
          completedResults={completedResults}
          completedScore={completedScore}
          dailyDateKey={dateKey}
          onStart={() => setStarted(true)}
        />
      </>
    );
  }

  return (
    <>
      <AppHead title="Daily | Wikitrivia" />
      <GameRouteScreen mode="daily" skipRouteIntro />
    </>
  );
}
