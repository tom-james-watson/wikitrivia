import classNames from "classnames";
import { motion } from "motion/react";
import * as styles from "../styles/lives.css";

const MAX_LIVES = 3;

interface LifeIndicatorProps {
  filled: boolean;
  index: number;
}

function LifeIndicator(props: LifeIndicatorProps) {
  const { filled, index } = props;

  return (
    <motion.div
      animate={{ opacity: filled ? 1 : 0.72, scale: filled ? 1 : 0.96 }}
      aria-hidden="true"
      className={classNames(styles.life, {
        [styles.filled]: filled,
      })}
      transition={{ delay: index * 0.07, duration: 0.22, ease: "easeOut" }}
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
        <LifeIndicator filled={mistakes >= 1} index={0} />
        <LifeIndicator filled={mistakes >= 2} index={1} />
        <LifeIndicator filled={mistakes >= 3} index={2} />
      </div>
    </div>
  );
}
