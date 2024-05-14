import React from "react";
import styles from "../styles/example-cards.module.scss";
import ItemCard from "./item-card";
import { getItemFromSlug } from "../lib/ademe-api";
import { Trans } from "@lingui/macro";

export default function ExampleCards() {
  return (
    <div className={styles.exampleCardsContainer}>
      <ItemCard item={getItemFromSlug("smartphone")!} />
      <div className={styles.question}>
        <p>+</p>
        <p><Trans>or</Trans></p>
        <p>-</p>
        <p>🤔</p>
      </div>
      <ItemCard item={getItemFromSlug("repasavecduboeuf")!} />
    </div>
  );
}
