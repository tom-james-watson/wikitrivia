import classNames from "classnames";
import React from "react";
import * as styles from "../styles/card-meta.css";

interface CardMetaProps {
  children: React.ReactNode;
  className?: string;
}

interface CardMetaTextProps extends CardMetaProps {
  tone?: "default" | "current";
}

export function CardMetaStack(props: CardMetaProps) {
  const { children, className } = props;

  return <div className={classNames(styles.stack, className)}>{children}</div>;
}

export function CardMetaFrame(props: CardMetaProps) {
  const { children, className } = props;

  return <div className={classNames(styles.frame, className)}>{children}</div>;
}

export function CardMetaText(props: CardMetaTextProps) {
  const { children, className, tone = "default" } = props;

  return (
    <div
      className={classNames(styles.text, className, {
        [styles.textCurrent]: tone === "current",
      })}
    >
      {children}
    </div>
  );
}
