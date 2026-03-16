import { animate, motion, PanInfo, useMotionValue } from "motion/react";
import React from "react";
import { PreparedCard } from "../types/game";
import CardVisual from "./card-visual";

interface DraggableDeckCardProps {
  anchorRef?: React.MutableRefObject<HTMLDivElement | null>;
  cardStyle?: React.CSSProperties;
  item: PreparedCard;
  onAnchorChange?: (node: HTMLDivElement | null) => void;
  onDragMove: (point: { x: number; y: number }, rect: DOMRect | null) => void;
  onDragStart: (point: { x: number; y: number }, rect: DOMRect | null) => void;
  onDrop: (point: { x: number; y: number }, rect: DOMRect | null) => boolean;
}

export default function DraggableDeckCard(props: DraggableDeckCardProps) {
  const {
    anchorRef,
    cardStyle,
    item,
    onAnchorChange,
    onDragMove,
    onDragStart,
    onDrop,
  } = props;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [dropAccepted, setDropAccepted] = React.useState(false);

  React.useEffect(() => {
    setDropAccepted(false);
    x.set(0);
    y.set(0);
  }, [item.id, x, y]);

  const handleCardRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      onAnchorChange?.(node);
      cardRef.current = node;
      if (anchorRef) {
        anchorRef.current = node;
      }
    },
    [anchorRef, onAnchorChange],
  );

  const getCardRect = React.useCallback(() => {
    return cardRef.current?.getBoundingClientRect() ?? null;
  }, []);

  const handlePointer = React.useCallback(
    (
      callback:
        | DraggableDeckCardProps["onDragMove"]
        | DraggableDeckCardProps["onDragStart"],
      info: PanInfo,
    ) => {
      callback(info.point, getCardRect());
    },
    [getCardRect],
  );

  return (
    <motion.div
      ref={handleCardRef}
      drag
      dragElastic={0.03}
      dragMomentum={false}
      onDrag={(_event, info: PanInfo) => {
        handlePointer(onDragMove, info);
      }}
      onDragEnd={(_event, info: PanInfo) => {
        const accepted = onDrop(info.point, getCardRect());

        if (accepted) {
          setDropAccepted(true);
        } else {
          setDragging(false);
          void animate(x, 0, {
            duration: 0.22,
            ease: [0.22, 1, 0.36, 1],
          });
          void animate(y, 0, {
            duration: 0.22,
            ease: [0.22, 1, 0.36, 1],
          });
        }
      }}
      onDragStart={(_event, info: PanInfo) => {
        setDragging(true);
        handlePointer(onDragStart, info);
      }}
      style={{
        cursor: "grab",
        height: 200,
        opacity: dropAccepted ? 0 : 1,
        pointerEvents: dropAccepted ? "none" : "auto",
        position: "relative",
        touchAction: "none",
        visibility: dropAccepted ? "hidden" : "visible",
        width: 150,
        x,
        y,
        zIndex: dragging || dropAccepted ? 40 : 2,
      }}
    >
      <CardVisual item={item} style={cardStyle} surface="deck" />
    </motion.div>
  );
}
