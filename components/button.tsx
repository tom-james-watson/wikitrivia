import React from "react";
import classNames from "classnames";
import styles from "../styles/button.module.scss";

interface Props {
  minimal?: boolean;
  big?: boolean;
  disabled?: boolean;
  onClick: () => void;
  text: string;
}

export default function Button(props: Props) {
  const { minimal = false, big = false, disabled = false, onClick, text } = props;

  return (
    <button
      onClick={onClick}
      className={classNames(styles.button, { [styles.minimal]: minimal }, { [styles.big]: big })}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
