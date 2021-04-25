import React from "react";
import { animated, useSpring } from "react-spring";
import styles from "../styles/game-over.module.scss";

interface Props {
  resetGame: () => void;
  score: number;
}

export default function GameOver(props: Props) {
  const { resetGame, score } = props;

  const highscore = Number(localStorage.getItem("highscore") ?? "0");

  React.useLayoutEffect(() => {
    if (score > highscore) {
      localStorage.setItem("highscore", String(score));
    }
  }, [score, highscore]);

  const animProps = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 500 },
  });

  return (
    <animated.div style={animProps} className={styles.gameOver}>
      <span className={styles.score}>Score: {score}</span>
      {highscore !== 0 && (
        <span className={styles.highscore}>High Score: {highscore}</span>
      )}
      <button onClick={resetGame} className={styles.resetGame}>
        Play again
      </button>
    </animated.div>
  );
}
