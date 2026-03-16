import React from "react";
import { GameDifficulty } from "../types/game";
import {
  loadFreePlayDifficulty,
  saveFreePlayDifficulty,
} from "./free-play-storage";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

interface FreePlayDifficultyValue {
  difficulty: GameDifficulty;
  ready: boolean;
  setDifficulty: (difficulty: GameDifficulty) => void;
}

const FreePlayDifficultyContext = React.createContext<FreePlayDifficultyValue>({
  difficulty: "normal",
  ready: false,
  setDifficulty: () => {},
});

export function FreePlayDifficultyProvider(props: {
  children: React.ReactNode;
}) {
  const { children } = props;
  const [difficulty, setDifficultyState] =
    React.useState<GameDifficulty>("normal");
  const [ready, setReady] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    setDifficultyState(loadFreePlayDifficulty());
    setReady(true);
  }, []);

  const setDifficulty = React.useCallback((nextDifficulty: GameDifficulty) => {
    setDifficultyState(nextDifficulty);
    saveFreePlayDifficulty(nextDifficulty);
  }, []);

  const value = React.useMemo(
    () => ({
      difficulty,
      ready,
      setDifficulty,
    }),
    [difficulty, ready, setDifficulty],
  );

  return (
    <FreePlayDifficultyContext.Provider value={value}>
      {children}
    </FreePlayDifficultyContext.Provider>
  );
}

export function useFreePlayDifficulty(): FreePlayDifficultyValue {
  return React.useContext(FreePlayDifficultyContext);
}
