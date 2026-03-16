import { motion } from "motion/react";
import { PlayedCard } from "../types/cards";
import { PreparedCard } from "../types/game";
import CardVisual from "./card-visual";

type Props = {
  flippedId?: null | string;
  layout?: boolean | "position";
  item: PreparedCard | PlayedCard;
  revealDatePill?: boolean;
  setFlippedId?: (flippedId: string | null) => void;
  surface?: "deck" | "timeline";
};

export default function ItemCard(props: Props) {
  const {
    flippedId,
    layout = true,
    item,
    revealDatePill = true,
    setFlippedId,
    surface = "timeline",
  } = props;

  const flipped = item.id === flippedId;
  const isJustPlacedCard = "played" in item && item.played.justPlaced === true;

  return (
    <motion.div layout={layout}>
      <CardVisual
        animateTransform={{ rotateY: flipped ? 180 : 0 }}
        flipped={flipped}
        initialTransform={
          isJustPlacedCard
            ? {
                rotateY: flipped ? 180 : 0,
              }
            : false
        }
        item={item}
        onClick={() => {
          if ("played" in item && setFlippedId) {
            setFlippedId(flipped ? null : item.id);
          }
        }}
        revealDatePill={revealDatePill}
        surface={surface}
      />
    </motion.div>
  );
}
