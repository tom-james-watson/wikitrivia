import { LayoutGroup, motion } from "motion/react";
import React from "react";
import { PlayedCard } from "../types/cards";
import ItemCard from "./item-card";
import * as styles from "../styles/played-item-list.css";

const TIMELINE_LAYOUT_TRANSITION = {
  layout: {
    duration: 0.52,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

interface PlayedItemListProps {
  hiddenCardId: string | null;
  isDragging: boolean;
  items: PlayedCard[];
  layoutAnimationsEnabled?: boolean;
  onOpeningAnchorChange?: (node: HTMLDivElement | null) => void;
  openingAnchorRef: React.MutableRefObject<HTMLDivElement | null>;
  previewIndex: number | null;
}

export default function PlayedItemList(props: PlayedItemListProps) {
  const {
    hiddenCardId,
    isDragging,
    items,
    layoutAnimationsEnabled = true,
    onOpeningAnchorChange,
    openingAnchorRef,
    previewIndex,
  } = props;
  const [flippedId, setFlippedId] = React.useState<null | string>(null);

  React.useEffect(() => {
    if (isDragging && flippedId !== null) {
      setFlippedId(null);
    }
  }, [flippedId, isDragging]);

  const handleOpeningAnchorRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      onOpeningAnchorChange?.(node);
      openingAnchorRef.current = node;
    },
    [onOpeningAnchorChange, openingAnchorRef],
  );

  const renderedSlots = React.useMemo(() => {
    const slots: React.ReactNode[] = [];

    if (items.length === 0 && previewIndex === null) {
      slots.push(
        <div key="opening-anchor-slot" className={styles.itemSlot}>
          <div ref={handleOpeningAnchorRef} className={styles.openingAnchor} />
        </div>,
      );
      return slots;
    }

    items.forEach((item, index) => {
      if (previewIndex === index) {
        slots.push(
          <motion.div
            key="preview-gap"
            layout={layoutAnimationsEnabled ? "position" : false}
            layoutAnchor={
              layoutAnimationsEnabled ? { x: 0.5, y: 0.5 } : undefined
            }
            className={styles.previewGap}
            transition={TIMELINE_LAYOUT_TRANSITION}
          />,
        );
      }

      const cardHidden = hiddenCardId === item.id;

      slots.push(
        <motion.div
          key={item.id}
          layout={layoutAnimationsEnabled ? "position" : false}
          layoutAnchor={
            layoutAnimationsEnabled ? { x: 0.5, y: 0.5 } : undefined
          }
          className={styles.itemSlot}
          transition={TIMELINE_LAYOUT_TRANSITION}
          data-card-id={item.id}
          style={{ pointerEvents: cardHidden ? "none" : "auto", zIndex: 1 }}
        >
          {cardHidden ? (
            <div aria-hidden="true" className={styles.hiddenCardPlaceholder} />
          ) : (
            <ItemCard
              flippedId={flippedId}
              item={item}
              layout={false}
              revealDatePill={item.played.showDate}
              setFlippedId={setFlippedId}
            />
          )}
        </motion.div>,
      );
    });

    if (previewIndex === items.length) {
      slots.push(
        <motion.div
          key="preview-gap"
          layout={layoutAnimationsEnabled ? "position" : false}
          layoutAnchor={
            layoutAnimationsEnabled ? { x: 0.5, y: 0.5 } : undefined
          }
          className={styles.previewGap}
          transition={TIMELINE_LAYOUT_TRANSITION}
        />,
      );
    }

    return slots;
  }, [
    flippedId,
    hiddenCardId,
    handleOpeningAnchorRef,
    items,
    layoutAnimationsEnabled,
    previewIndex,
  ]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.stage}>
        <div className={styles.rail}>
          <LayoutGroup id="timeline-layout">
            <motion.div
              layout={layoutAnimationsEnabled ? "position" : false}
              layoutAnchor={
                layoutAnimationsEnabled ? { x: 0.5, y: 0.5 } : undefined
              }
              layoutDependency={previewIndex}
              className={styles.list}
              transition={TIMELINE_LAYOUT_TRANSITION}
            >
              <motion.div
                layout={layoutAnimationsEnabled ? "position" : false}
                layoutAnchor={
                  layoutAnimationsEnabled ? { x: 0.5, y: 0.5 } : undefined
                }
                layoutDependency={previewIndex}
                className={styles.items}
                data-played-items="true"
                transition={TIMELINE_LAYOUT_TRANSITION}
              >
                {renderedSlots}
              </motion.div>
            </motion.div>
          </LayoutGroup>
        </div>
      </div>
    </div>
  );
}
