import React from "react";
import styles from "../styles/instructions.module.scss";
import Button from "./button";
import Score from "./score";

interface Props {
  highscore: number;
  start: () => void;
}

export default function Instructions(props: Props) {
  const { highscore, start } = props;

  return (
    <div className={styles.instructions}>
      <div className={styles.wrapper}>
        <h2>Place the cards on the timeline in the correct order.</h2>
        <div className={styles.highscoreWrapper}>
          <Score score={highscore} title="Best streak" />
        </div>
        <Button onClick={start} text="Start game!" />
      </div>
    </div>
  );
}
