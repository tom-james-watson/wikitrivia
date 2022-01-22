import React from "react";
import styles from "../styles/instructions.module.scss";
import Button from "./button";

interface Props {
  start: () => void;
}

export default function Instructions(props: Props) {
  const { start } = props;

  return (
    <div className={styles.instructions}>
      <div className={styles.wrapper}>
        <h2>Place the cards on the timeline in the correct order.</h2>
        <h2>Get 10 correct to win.</h2>
        <Button onClick={start} text="Start game!" />
        <div className={styles.about}>
          <div>
            A forked version of{" "}
            <a
              href="https://github.com/tom-james-watson/wikitrivia/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wikitrivia by Tom James Watson
            </a>
            .
          </div>
          <div>
            All data sourced from{" "}
            <a
              href="https://www.wikidata.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wikidata
            </a>{" "}
            and{" "}
            <a
              href="https://www.wikipedia.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wikipedia
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
