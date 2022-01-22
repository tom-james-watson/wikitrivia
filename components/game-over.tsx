import React from "react";
import { animated, useSpring } from "react-spring";
import styles from "../styles/game-over.module.scss";
import Button from "./button";
import Score from "./score";

interface Props {
  resetGame: () => void;
  score: number;
}

export default function GameOver(props: Props) {
  const { resetGame, score } = props;

  const animProps = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 500 },
  });

  return (
    <animated.div style={animProps} className={styles.gameOver}>
      <div className={styles.scoresWrapper}>
        <div className={styles.score}>
          <Score score={score} title={score === 10 ? "You won!" : "Score"} />
        </div>
      </div>
      <Button onClick={resetGame} text="Play again!" />
    </animated.div>
  );
}
