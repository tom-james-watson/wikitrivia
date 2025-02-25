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
      src="./images/heart.svg"
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
      {lives}
      <img className={styles.heart} src="./images/heart.svg" />
    </div>
  );
}
