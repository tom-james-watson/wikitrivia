import React from "react";
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
        <h1>Dis<span style={{color: "#993344"}}>CO<sub>2</sub></span>very</h1>
        <h2>Place the cards in the correct order guessing their CO<sub>2</sub> footprint.</h2>
        {highscore !== 0 && (
          <div className={styles.highscoreWrapper}>
            <Score score={highscore} title="Best streak" />
          </div>
        )}
        <Button onClick={start} text="Start game" />
        <div className={styles.about}>
          <p>Made with <img src="/autres/co2/images/heart.svg" title="love" alt="love" className={styles.heartImg} /> by <a href="https://antoine.duparay.fr">Fla</a> &amp; Sara.</p>
          <p>License MIT - Source code available <a href="https://github.com/flaburgan/wikitrivia">on github</a>.</p>
          <p>Based on the <a href="https://wikitrivia.tomjwatson.com/"></a> games by Tom James Watson.</p>
        </div>
      </div>
    </div>
  );
}
