import React, { useState } from "react";
import GitHubButton from "react-github-btn";
import styles from "../styles/instructions.module.scss";
import Button from "./button";
import Score from "./score";
import classNames from "classnames";
import buttonStyles from "../styles/button.module.scss";

interface Props {
  highscore: number;
  startDaily: () => void;
  startRandom: () => void;
  startSpecific: (seed: string) => void;
}

interface JoinFieldProps {
  startSpecific: (seed: string) => void;
}


function JoinField(props: JoinFieldProps) {
  const [seedInput, setSeedInput] = useState("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSeedInput(event.currentTarget.value)
  }

  const handleKey = (event: React.KeyboardEvent) => {
    console.log(event.key);
    if (event.key === "Enter") {
      props.startSpecific(seedInput);
    }
  }

  return (
    <input 
      autoFocus
      type="text" 
      onChange={handleChange} 
      onKeyPress={handleKey} 
      className={classNames(buttonStyles.button, buttonStyles.minimal)}
    />
  );
}

export default function Instructions(props: Props) {
  const [joining, setJoining] = useState<boolean>(false);
  const { highscore, startDaily, startRandom, startSpecific } = props;

  return (
    <div className={styles.instructions}>
      <div className={styles.wrapper}>
        <h2>Place the cards on the timeline in the correct order.</h2>
        {highscore !== 0 && (
          <div className={styles.highscoreWrapper}>
            <Score score={highscore} title="Best streak" />
          </div>
        )}
        <div className={styles.buttons}>
          <Button onClick={startDaily} text="Daily" />
          <Button onClick={startRandom} text="New game" />
          {
            joining ? (
              <JoinField startSpecific={startSpecific}/>
            ) : (
              <Button onClick={() => {setJoining(true);}} text="Join game" />
            )
          }
        </div>
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
              href="https://github.com/tom-james-watson/wikitrivia/issues/"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            .
          </div>
          <GitHubButton
            href="https://github.com/tom-james-watson/wikitrivia"
            data-size="large"
            data-show-count="true"
            aria-label="Star tom-james-watson/wikitrivia on GitHub"
          >
            Star
          </GitHubButton>
        </div>
      </div>
    </div>
  );
}
