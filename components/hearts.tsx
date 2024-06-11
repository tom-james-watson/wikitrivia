import React from "react";
import classNames from "classnames";
import styles from "../styles/hearts.module.scss";

interface HeartProps {
  have: boolean;
}

function Heart(props: HeartProps) {
  const { have } = props;

  return (
    <img
      className={classNames(styles.heart, have ? "" : styles.lost)}
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
      <Heart have={lives >= 4} />
      <Heart have={lives >= 5} />
    </div>
  );
}
