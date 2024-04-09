import React from "react";
import styles from "../styles/instructions.module.scss";
import Button from "./button";
import Score from "./score";
import CategoriesSelector from "./categories-selector";

interface Props {
  highscore: number;
  start: () => void;
  selectedCategories: boolean[];
  setSelectedCategories: (selectedCategories: boolean[]) => void;
}

export default function Instructions(props: Props) {
  const { highscore, start, selectedCategories } = props;

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
        <CategoriesSelector selectedCategories={props.selectedCategories} setSelectedCategories={props.setSelectedCategories} />
        <div className={styles.startButton}>
          <Button onClick={start} big={true} disabled={!selectedCategories.includes(true)} text="Start game" />
        </div>
      </div>
      <div className={styles.about}>
        <p>Made with <img src="/images/heart.svg" title="love" alt="love" className={styles.heartImg} /> by <a href="https://antoine.duparay.fr" rel="noreferrer" target="_blank">Fla</a> &amp; Sara.</p>
        <p>License AGPL - Source code available <a href="https://github.com/flaburgan/disco2very" rel="noreferrer" target="_blank">on github</a>.</p>
        <p>Code forked from the <a href="https://wikitrivia.tomjwatson.com/" rel="noreferrer" target="_blank">wikitrivia</a> games by <a href="https://tomjwatson.com/" rel="noreferrer" target="_blank">Tom James Watson</a>. Thank you!</p>
        <p>
          The numbers are coming from the <a href="https://www.ademe.fr/" rel="noreferrer" target="_blank">Ademe</a> platform <a href="https://impactco2.fr/" rel="noreferrer" target="_blank">Impact CO<sub>2</sub></a>.
          Thanks to them for their amazing work!
        </p>
        <p>
          <a href="https://impactco2.fr/" rel="noreferrer" target="_blank">
            <img src="images/ICO2_white.svg" alt="Impact CO2 Logo" className={styles.ico2logo} />
          </a>
        </p>
      </div>
    </div>
  );
}
