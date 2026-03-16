import classNames from "classnames";
import Link from "next/link";
import * as styles from "../styles/button.css";

interface Props {
  fullWidth?: boolean;
  href: string;
  minimal?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  trailingIcon?: "chevron" | "play";
  text: string;
}

function TrailingIcon(props: { icon: "chevron" | "play" }) {
  const { icon } = props;

  if (icon === "play") {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        height="14"
        viewBox="0 0 14 14"
        width="14"
      >
        <path d="M4.5 3.2V10.8L10.6 7L4.5 3.2Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      viewBox="0 0 14 14"
      width="14"
    >
      <path
        d="M5 3L9 7L5 11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export default function ButtonLink(props: Props) {
  const {
    fullWidth = false,
    href,
    minimal = false,
    onClick,
    text,
    trailingIcon,
  } = props;

  return (
    <Link
      className={classNames(styles.button, {
        [styles.fullWidth]: fullWidth,
        [styles.minimal]: minimal,
        [styles.withTrailingIcon]: trailingIcon,
      })}
      href={href}
      onClick={onClick}
      prefetch
    >
      <span className={styles.content}>
        <span className={styles.label}>{text}</span>
        {trailingIcon ? (
          <span className={styles.icon}>
            <TrailingIcon icon={trailingIcon} />
          </span>
        ) : null}
      </span>
    </Link>
  );
}
