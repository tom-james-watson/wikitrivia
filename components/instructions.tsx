import React from "react";
import styles from "../styles/instructions.module.scss";
import Button from "./button";
import Score from "./score";
import CategoriesSelector from "./categories-selector";
import { Trans } from "@lingui/macro";
import { msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";

interface Props {
  highscore: number;
  start: () => void;
  selectedCategories: boolean[];
  setSelectedCategories: (selectedCategories: boolean[]) => void;
}

export default function Instructions(props: Props) {
  const { highscore, start, selectedCategories } = props;
  const { _ } = useLingui();

  return (
    <div className={styles.instructions}>
      <div className={styles.wrapper}>
        <h1>Dis<span style={{color: "#993344"}}>CO<sub>2</sub></span>very</h1>
        <h2><Trans>Place the cards in the correct order guessing their CO<sub>2</sub> footprint.</Trans></h2>
        {highscore !== 0 && (
          <div className={styles.highscoreWrapper}>
            <Score score={highscore}><Trans>Best streak</Trans></Score>
          </div>
        )}
        <CategoriesSelector selectedCategories={props.selectedCategories} setSelectedCategories={props.setSelectedCategories} />
        <div className={styles.startButton}>
          <Button onClick={start} big={true} disabled={!selectedCategories.includes(true)}><Trans>Start game</Trans></Button>
        </div>
      </div>
      <div className={styles.about}>
        <p><Trans>Made with <img src="/images/heart.svg" title={_(msg`love`)} alt={_(msg`love`)} className={styles.heartImg} /> by <a href="https://antoine.duparay.fr" rel="noreferrer" target="_blank">Fla</a> &amp; Sara.</Trans></p>
        <p><Trans>License AGPL - Source code available <a href="https://github.com/flaburgan/disco2very" rel="noreferrer" target="_blank">on github</a>.</Trans></p>
        <p>
          <Trans>
            Code based on from the <a href="https://wikitrivia.tomjwatson.com/" rel="noreferrer" target="_blank">wikitrivia</a> game by <a href="https://tomjwatson.com/" rel="noreferrer" target="_blank">Tom James Watson</a>. Thank you!
          </Trans>
        </p>
        <p>
          <Trans>
            The numbers are coming from the <a href="https://www.ademe.fr/" rel="noreferrer" target="_blank">Ademe</a> platform <a href="https://impactco2.fr/" rel="noreferrer" target="_blank">Impact CO<sub>2</sub></a>.
            Thanks to them for their amazing work!
          </Trans>
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
