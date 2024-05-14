import React from "react";
import classNames from "classnames";
import { Item, PlayedItem } from "../types/item";
import { round2 } from "../lib/items";
import { loadCategories } from "../lib/ademe-api";
import styles from "../styles/item-card.module.scss";

type Props = {
  item: Item | PlayedItem;
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ItemCard(props: Props) {
  const { item } = props;
  const categories = loadCategories();

  return (
    <div
      className={styles.front}
      style={{border: "solid " + categories[item.categoryId - 1].color + " 4px" }}
    >
      <header className={styles.top}>
        <h2 className={styles.label}>{capitalize(item.label)}</h2>
      </header>
      <main
        // className={styles.image}
        // style={{
        //   backgroundImage: `url("${item.image}")`,
        // }}
        dangerouslySetInnerHTML={{__html: "<div>" + item.description + "</div><div>" + item.image + "</div>"}}
      >
      </main>
      <div
        className={classNames(styles.bottom, {
          [styles.correct]: "played" in item && item.played.correct,
          [styles.incorrect]: "played" in item && !item.played.correct,
        })}
      >
        <span>
          {"played" in item ? round2(item.source.ecv) : "?"} kg CO<sub>2</sub>
        </span>
      </div>
    </div>
  );
}
