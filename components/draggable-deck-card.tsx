import {
  animate,
  motion,
  PanInfo,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import React from "react";
import { PreparedCard } from "../types/game";
import CardVisual from "./card-visual";

// How far the card leans for a given drag speed, and where it stops leaning.
const TILT_PER_PX_PER_SECOND = 0.005;
const MAX_TILT_DEG = 4;
const LIFT_SCALE = 1.03;
const TILT_SPRING = { damping: 16, mass: 0.6, stiffness: 180 };
const LIFT_SPRING = { damping: 26, mass: 0.7, stiffness: 420 };
const RETURN_SPRING = {
  damping: 30,
  mass: 0.9,
  stiffness: 380,
  type: "spring",
} as const;

function clampTilt(velocity: number) {
  return Math.max(
    -MAX_TILT_DEG,
    Math.min(MAX_TILT_DEG, velocity * TILT_PER_PX_PER_SECOND),
  );
}

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
  const reduceMotion = useReducedMotion();

  // The card trails the pointer: it leans into the direction of travel in
  // proportion to speed, and swings back to flat when the hand stops.
  const velocityX = useVelocity(x);
  const rotate = useSpring(useTransform(velocityX, clampTilt), TILT_SPRING);

  // 0 resting on the deck, 1 held in the air.
  const liftTarget = useMotionValue(0);
  const lift = useSpring(liftTarget, LIFT_SPRING);
  const scale = useTransform(lift, [0, 1], [1, LIFT_SCALE]);

  React.useEffect(() => {
    setDropAccepted(false);
    x.set(0);
    y.set(0);
    liftTarget.set(0);
  }, [item.id, liftTarget, x, y]);

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
          liftTarget.set(0);
          // A spring carries the release velocity, so a flicked card
          // overshoots the deck slightly before settling.
          const returnTransition = reduceMotion
            ? ({ duration: 0.22, ease: [0.22, 1, 0.36, 1] } as const)
            : RETURN_SPRING;
          void animate(x, 0, returnTransition);
          void animate(y, 0, returnTransition);
        }
      }}
      onPointerCancel={() => {
        liftTarget.set(0);
      }}
      onPointerDown={() => {
        liftTarget.set(1);
      }}
      onPointerUp={() => {
        if (!dragging) {
          liftTarget.set(0);
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
      <motion.div style={reduceMotion ? undefined : { rotate, scale }}>
        <CardVisual item={item} lift={lift} style={cardStyle} surface="deck" />
      </motion.div>
    </motion.div>
  );
}
