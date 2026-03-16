import { motion } from "motion/react";
import React from "react";
import { PreparedCard } from "../types/game";
import CardVisual from "./card-visual";

interface DealAnimationLayerProps {
  card: PreparedCard;
  from: {
    x: number;
    y: number;
  };
  to: {
    x: number;
    y: number;
  };
}

export default function DealAnimationLayer(props: DealAnimationLayerProps) {
  const { card, from, to } = props;
  const [animationStarted, setAnimationStarted] = React.useState(false);

  React.useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setAnimationStarted(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [card.id, from.x, from.y, to.x, to.y]);

  return (
    <motion.div
      animate={
        animationStarted
          ? {
              x: to.x - from.x,
              y: to.y - from.y,
            }
          : {
              x: 0,
              y: 0,
            }
      }
      className="dealAnimationLayer"
      initial={false}
      style={{
        left: from.x,
        pointerEvents: "none",
        position: "absolute",
        top: from.y,
        zIndex: 8,
      }}
      transition={{
        duration: 0.72,
        ease: [0.2, 0.9, 0.22, 1],
      }}
    >
      <CardVisual
        animateTransform={
          animationStarted
            ? {
                rotateY: 0,
                y: 0,
              }
            : {
                rotateY: 180,
                y: 0,
              }
        }
        backVariant="deck"
        flipped={false}
        initialTransform={false}
        item={card}
        surface="deck"
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </motion.div>
  );
}
