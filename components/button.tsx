import React from "react";
import styles from "../styles/button.module.scss";

interface Props {
  onClick: () => void;
  text: string;
}

export default function Button(props: Props) {
  const { onClick, text } = props;

  return (
    <button onClick={onClick} className={styles.button}>
      {text}
    </button>
  );
}
