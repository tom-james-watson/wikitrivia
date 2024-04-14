import React from "react";
import EmailRegistration from "./email-registration";
import styles from "../styles/real-cards-game.module.scss";
import { Trans } from "@lingui/macro";

export default function realCardsGame() {
  return (
    <div className={styles.realCardsGame}>
      <h2><Trans>A real pack of cards?</Trans></h2>
      <p>
        <Trans>This game has been created as a web app to test the idea and see if it is enjoyable, but the ultimate goal is to print a real deck of cards
          as we feel that it can be a useful tool for raising awareness about climate change. Possibly, we may do a crowdfunding campaign, so you could order your own pack of cards!</Trans>
      </p>
      <p><Trans>Interested about this, or simply want to be aware of news about disCO<sub>2</sub>very? We can keep in touch by e-mail!</Trans></p>
      <EmailRegistration />
    </div>
  );
}