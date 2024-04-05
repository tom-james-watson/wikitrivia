import React from "react";
import classNames from "classnames";
import styles from "../styles/button.module.scss";

interface Props {
  minimal?: boolean;
  disabled?: boolean;
  onClick: () => void;
  text: string;
}

export default function Button(props: Props) {
  const { minimal = false, disabled = false, onClick, text } = props;

  return (
    <button
      onClick={onClick}
      className={classNames(styles.button, { [styles.minimal]: minimal })}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
