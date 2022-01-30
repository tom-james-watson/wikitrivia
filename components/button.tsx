import React from "react";
import classNames from "classnames";
import styles from "../styles/button.module.scss";

interface Props {
  minimal?: boolean;
  onClick: () => void;
  text: string;
}

export default function Button(props: Props) {
  const { minimal = false, onClick, text } = props;

  return (
    <button
      onClick={onClick}
      className={classNames(styles.button, { [styles.minimal]: minimal })}
    >
      {text}
    </button>
  );
}
