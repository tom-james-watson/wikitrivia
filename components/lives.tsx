import classNames from "classnames";
import { motion } from "motion/react";
import * as styles from "../styles/lives.css";

const MAX_LIVES = 3;

interface LifeIndicatorProps {
  filled: boolean;
}

function LifeIndicator(props: LifeIndicatorProps) {
  const { filled } = props;

  return (
    <motion.div
      animate={{
        opacity: filled ? 1 : 0.72,
        scale: filled ? [0.96, 1.22, 1] : 0.96,
      }}
      aria-hidden="true"
      className={classNames(styles.life, {
        [styles.filled]: filled,
      })}
      initial={false}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

interface Props {
  lives: number;
}

export default function Lives(props: Props) {
  const { lives } = props;
  const mistakes = MAX_LIVES - lives;

  return (
    <div
      aria-label={`${mistakes} mistakes out of ${MAX_LIVES}`}
      className={styles.lives}
    >
      <div className={styles.dots}>
        <LifeIndicator filled={mistakes >= 1} />
        <LifeIndicator filled={mistakes >= 2} />
        <LifeIndicator filled={mistakes >= 3} />
      </div>
    </div>
  );
}
