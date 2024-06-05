import React from "react";
import styles from "../styles/example-cards.module.scss";
import ItemCard from "./item-card";
import { getItemFromSlug } from "../lib/ademe-api";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { Locale } from "../types/i18n";

export default function ExampleCards() {
  const { i18n } = useLingui();
  const locale = i18n.locale as Locale;

  return (
    <div className={styles.exampleCardsContainer}>
      <ItemCard item={getItemFromSlug("smartphone", locale)!} />
      <div className={styles.question}>
        <p>+</p>
        <p><Trans>or</Trans></p>
        <p>-</p>
        <p>🤔</p>
      </div>
      <ItemCard item={getItemFromSlug("repasavecduboeuf", locale)!} />
    </div>
  );
}
