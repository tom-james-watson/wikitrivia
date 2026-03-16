import classNames from "classnames";
import React from "react";
import { GameDifficulty } from "../types/game";
import * as styles from "../styles/difficulty-selector.css";

interface Props {
  availableDifficulties?: GameDifficulty[];
  difficulty: GameDifficulty;
  setDifficulty: (difficulty: GameDifficulty) => void;
}

const difficultyOptions: Array<{
  label: string;
  value: GameDifficulty;
}> = [
  {
    label: "Easy",
    value: "easy",
  },
  {
    label: "Normal",
    value: "normal",
  },
  {
    label: "Hard",
    value: "hard",
  },
];

export default function DifficultySelector(props: Props) {
  const { availableDifficulties, difficulty, setDifficulty } = props;
  const selectedDifficulty =
    availableDifficulties &&
    availableDifficulties.length > 0 &&
    !availableDifficulties.includes(difficulty)
      ? availableDifficulties[0]
      : difficulty;
  const difficultyIndex = difficultyOptions.findIndex(
    (option) => option.value === selectedDifficulty,
  );

  return (
    <div className={styles.difficultySection}>
      <div
        className={styles.difficultyOptions}
        style={
          {
            [styles.difficultyIndexVarName]: String(difficultyIndex),
          } as React.CSSProperties
        }
      >
        <div aria-hidden="true" className={styles.difficultySlider} />
        {difficultyOptions.map((option) => {
          const disabled =
            availableDifficulties !== undefined &&
            !availableDifficulties.includes(option.value);

          return (
            <button
              key={option.value}
              className={classNames(styles.difficultyOption, {
                [styles.active]: selectedDifficulty === option.value,
                [styles.disabled]:
                  disabled && selectedDifficulty !== option.value,
              })}
              disabled={disabled}
              onClick={() => setDifficulty(option.value)}
              type="button"
            >
              <span className={styles.optionTitle}>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
