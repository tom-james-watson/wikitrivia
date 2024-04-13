import React from "react";
import classNames from "classnames";
import footprintDetailCategories from "../data/ademe/footprintDetailCategories";
import { Item } from "../types/item";
import { displayCO2, round2 } from "../lib/items";
import styles from "../styles/explanation-dialog.module.scss";
import { Trans, t } from "@lingui/macro";

interface ExplanationDialogProps {
  item: Item;
  onExit: () => void;
}

export default function ExplanationDialog(props: ExplanationDialogProps) {
  const {item, onExit} = props;
  const details = item.source.footprintDetail;
  const usage = item.source.usage;
  const endOfLife = item.source.endOfLife;

  return (
    <div className={classNames(styles.explanationDialogContainer)} onClick={onExit}>
      <div className={classNames(styles.explanationDialog)}>
        <header className={styles.top}>
          <h2 className={styles.label}>{item.label}:</h2>
        </header>
        <main>
          {
            item.explanation ? <p>{item.explanation}</p> : (
              <ul>
                {details && details.map(displayDetail)}
                {usage && displayUsage(usage)}
                {endOfLife && displayEndOfLife(endOfLife)}
              </ul>
            )
          }
        </main>
        <footer>
          <h3><Trans>Total:</Trans></h3>
          <p><strong>{round2(item.source.ecv)} kg CO<sub>2</sub>e</strong></p>
        </footer>
      </div>
    </div>
  );
}

function displayDetail(detail: {id: number, value: number}): JSX.Element {
  return <li key={"explanation-" + detail.id}>
    <h3>{footprintDetailCategories[detail.id]}</h3>
    <span>{displayCO2(detail.value)}</span>
  </li>;
}

function displayUsage(usage: {peryear: number, defaultyears: number}): JSX.Element {
  return <li>
    <h3><Trans>Usage:</Trans></h3>
    <span>{t`${displayCO2(usage.peryear)} per year, estimated lifetime: ${usage.defaultyears} years.`}</span>
  </li>;
}

function displayEndOfLife(endOfLife: number): JSX.Element {
  return <li>
    <h3><Trans>End of life:</Trans></h3>
    <span>{displayCO2(endOfLife)}</span>
  </li>;
}
