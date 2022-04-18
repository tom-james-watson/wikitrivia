import React from "react";
import GitHubButton from "react-github-btn";
import styles from "../styles/instructions.module.scss";
import Button from "./button";
import Score from "./score";

interface Props {
  highscore: number;
  start: () => void;
}

export default function Instructions(props: Props) {
  const { highscore, start } = props;

  return (
    <div className={styles.instructions}>
      <div className={styles.wrapper}>
        <h2>Place the cards on the timeline in the correct order.</h2>
        {highscore !== 0 && (
          <div className={styles.highscoreWrapper}>
            <Score score={highscore} title="Best streak" />
          </div>
        )}
        <Button onClick={start} text="Start game" />
        <div className={styles.about}>
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
          <div>
            Have feedback? Please report it on{" "}
            <a
              href="https://github.com/EdwardTheLegend/wikitrivia/issues/"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            .
          </div>
          <GitHubButton
            href="https://github.com/EdwardTheLegend/wikitrivia"
            data-size="large"
            data-show-count="true"
            aria-label="Star EdwardTheLegend/wikitrivia on GitHub"
          >
            Star
          </GitHubButton>
          <div>
            This game was forked from the original game by <a href="https://github.com/tom-james-watson/wikitrivia">Tom James Watson</a>
          </div>
        </div>
      </div>
    </div>
  );
}
