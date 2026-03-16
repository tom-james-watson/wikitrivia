import classNames from "classnames";
import * as styles from "../styles/button.css";

interface Props {
  fullWidth?: boolean;
  minimal?: boolean;
  onClick: () => void;
  text: string;
}

export default function Button(props: Props) {
  const { fullWidth = false, minimal = false, onClick, text } = props;

  return (
    <button
      onClick={onClick}
      className={classNames(styles.button, {
        [styles.fullWidth]: fullWidth,
        [styles.minimal]: minimal,
      })}
      type="button"
    >
      {text}
    </button>
  );
}
