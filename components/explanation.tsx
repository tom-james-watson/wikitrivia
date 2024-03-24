import React from "react";
import footprintDetailCategories from "../data/ademe/footprintDetailCategories";
import { Item } from "../types/item";
import { displayCO2 } from "../lib/items";

interface Props {
  item: Item;
}

export default function Explanation(props: Props) {
  const item = props.item;
  const details = item.source.footprintDetail;
  const usage = item.source.usage;
  const endOfLife = item.source.endoflife;

  return (
    <>
      {
        item.explanation ? <p>{item.explanation}</p> : (
          <>
            {details && <ul>{details.map(displayDetail)}</ul>}
            {usage && displayUsage(usage)}
            {endOfLife && displayEndOfLife(endOfLife)}
          </>
        )
      }
    </>
  );
}

function displayDetail(detail: {id: number, value: number}): JSX.Element {
  return <li>
    <h3>{footprintDetailCategories[detail.id]}</h3>
    <span>{displayCO2(detail.value)}</span>
  </li>;
}

function displayUsage(usage: {peryear: number, defaultyears: number}): JSX.Element {
  return <>
    <h3>Usage :</h3>
    <span>{displayCO2(usage.peryear) + " par an, durée de vie " + usage.defaultyears}</span>
  </>;
}

function displayEndOfLife(endOfLife: number): JSX.Element {
  return <>
    <h3>Fin de vie :</h3>
    <span>{displayCO2(endOfLife)}</span>
  </>;
}
