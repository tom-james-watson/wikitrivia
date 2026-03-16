import { motion } from "motion/react";
import React from "react";
import { assignInlineCssVars } from "../lib/assign-inline-css-vars";
import { PreparedCard } from "../types/game";
import CardVisual from "./card-visual";
import DraggableDeckCard from "./draggable-deck-card";
import { cardFaceShadowVar } from "../styles/item-card.css";
import * as styles from "../styles/next-item-list.css";

const CARD_FACE_SHADOW_STYLE = assignInlineCssVars([
  [cardFaceShadowVar, "none"],
]);

const STACK_BASE_CARD_STYLE = assignInlineCssVars([
  [cardFaceShadowVar, "none"],
]);

interface NextItemListProps {
  deckAnchorRef: React.MutableRefObject<HTMLDivElement | null>;
  deckState: "hidden" | "ready" | "revealing";
  next: PreparedCard | null;
  onDeckAnchorChange?: (node: HTMLDivElement | null) => void;
  onCardDragMove: (
    point: { x: number; y: number },
    rect: DOMRect | null,
  ) => void;
  onCardDragStart: (
    point: { x: number; y: number },
    rect: DOMRect | null,
  ) => void;
  onCardDrop: (
    point: { x: number; y: number },
    rect: DOMRect | null,
  ) => boolean;
  reserve: PreparedCard | null;
  visible: boolean;
}

function RevealingDeckCard(props: {
  item: PreparedCard;
  onDeckAnchorChange?: (node: HTMLDivElement | null) => void;
  topCardStyle?: React.CSSProperties;
}) {
  const { item, onDeckAnchorChange, topCardStyle } = props;
  const [revealStarted, setRevealStarted] = React.useState(false);

  React.useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setRevealStarted(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [item.id]);

  return (
    <div
      key={`${item.id}:revealing`}
      ref={onDeckAnchorChange}
      className={styles.topCardAnchor}
    >
      <CardVisual
        animateTransform={
          revealStarted
            ? {
                rotateY: 0,
                y: [0, -12, 0],
              }
            : {
                rotateY: 180,
                y: 0,
              }
        }
        backVariant="deck"
        flipped={false}
        initialTransform={false}
        item={item}
        surface="deck"
        style={topCardStyle}
        transition={{
          duration: 0.76,
          ease: [0.22, 1, 0.36, 1],
          times: [0, 0.42, 1],
        }}
      />
    </div>
  );
}

export default function NextItemList(props: NextItemListProps) {
  const {
    deckAnchorRef,
    deckState,
    next,
    onDeckAnchorChange,
    onCardDragMove,
    onCardDragStart,
    onCardDrop,
    reserve,
    visible,
  } = props;
  const renderedNext = next;
  const renderedReserve = reserve;
  const showStackBase =
    renderedReserve !== null || deckState !== "hidden" || renderedNext === null;
  const stackCard = showStackBase ? renderedReserve : null;
  const topCardStyle = CARD_FACE_SHADOW_STYLE;

  const handleDeckAnchorRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      onDeckAnchorChange?.(node);
      deckAnchorRef.current = node;
    },
    [deckAnchorRef, onDeckAnchorChange],
  );

  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0 }}
      className={styles.container}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className={styles.wrapper}>
        <div className={styles.list}>
          <div className={styles.stack}>
            {stackCard ? (
              <div className={styles.stackBase}>
                <CardVisual
                  backVariant="deck"
                  flipped
                  item={stackCard}
                  loadImage={false}
                  surface="deck"
                  style={STACK_BASE_CARD_STYLE}
                />
              </div>
            ) : null}
            <div className={styles.topCardSlot}>
              {renderedNext && deckState === "hidden" ? (
                <div
                  key={`${renderedNext.id}:hidden`}
                  ref={handleDeckAnchorRef}
                  className={styles.topCardAnchor}
                >
                  <CardVisual
                    backVariant="deck"
                    flipped
                    item={renderedNext}
                    loadImage={false}
                    surface="deck"
                    style={topCardStyle}
                  />
                </div>
              ) : null}
              {renderedNext && deckState === "revealing" ? (
                <RevealingDeckCard
                  item={renderedNext}
                  onDeckAnchorChange={handleDeckAnchorRef}
                  topCardStyle={topCardStyle}
                />
              ) : null}
              {renderedNext && deckState === "ready" ? (
                <DraggableDeckCard
                  anchorRef={deckAnchorRef}
                  cardStyle={topCardStyle}
                  item={renderedNext}
                  key={`${renderedNext.id}:ready`}
                  onAnchorChange={onDeckAnchorChange}
                  onDragMove={onCardDragMove}
                  onDragStart={onCardDragStart}
                  onDrop={onCardDrop}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
