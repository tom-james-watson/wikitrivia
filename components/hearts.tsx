import { useSpring, animated } from "react-spring";
import React from "react";
import styles from "../styles/hearts.module.scss";

interface HeartProps {
  have: boolean;
}

function Heart(props: HeartProps) {
  const { have } = props;
  const { opacity } = useSpring({
    opacity: have ? 1 : 0.4,
    config: { duration: 300 },
  });
  const { scale } = useSpring({
    scale: have ? 1 : 0.8,
    config: { mass: 1, tension: 200, friction: 20, duration: 300 },
    delay: 200,
  });

  return (
    <animated.img
      className={styles.heart}
      style={{ opacity, scale }}
      src="/images/heart.svg"
    />
  );
}

interface Props {
  lives: number;
}

export default function Hearts(props: Props) {
  const { lives } = props;

  return (
    <div className={styles.hearts}>
      <Heart have={lives >= 1} />
      <Heart have={lives >= 2} />
      <Heart have={lives >= 3} />
    </div>
  );
}
