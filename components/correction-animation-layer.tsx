import { motion, MotionValue } from "motion/react";
import { PlayedCard } from "../types/cards";
import CardVisual from "./card-visual";

interface CorrectionAnimationLayerProps {
  card: PlayedCard;
  from: {
    x: number;
    y: number;
  };
  onComplete: () => void;
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export default function CorrectionAnimationLayer(
  props: CorrectionAnimationLayerProps,
) {
  const { card, from, onComplete, x, y } = props;

  return (
    <motion.div
      onAnimationComplete={onComplete}
      style={{
        left: from.x,
        pointerEvents: "none",
        position: "absolute",
        top: from.y,
        x,
        y,
        zIndex: 14,
      }}
    >
      <CardVisual item={card} surface="timeline" />
    </motion.div>
  );
}
