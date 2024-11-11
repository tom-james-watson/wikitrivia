import React from "react";
import EmailRegistration from "./email-registration";
import styles from "../styles/real-cards-game.module.scss";
import { Trans } from "@lingui/macro";

export default function realCardsGame() {
  return (
    <div className={styles.realCardsGame}>
      <h2><Trans>A real deck of cards?</Trans></h2>
      <p>
        <Trans>This game is currently a digital app but the ultimate goal is to print a real deck of cards, as we feel that it can be a useful tool to raise awareness about climate change.
          Possibly, we may do a crowdfunding campaign, so you could order your own deck!</Trans>
      </p>
      <p><Trans>Interested? Or you simply want to be informed about the latest disCO<sub>2</sub>very news? We can keep in touch by e-mail!</Trans></p>
      <EmailRegistration />
    </div>
  );
}