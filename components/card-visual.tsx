import classNames from "classnames";
import {
  motion,
  MotionValue,
  Transition,
  useMotionValue,
  useTransform,
} from "motion/react";
import React, { Fragment } from "react";
import { EFFECTS } from "../lib/effects";
import { createWikimediaImageCandidates } from "../lib/image";
import { useCardImage } from "../lib/use-card-image";
import { useCardTheme } from "../lib/use-card-theme";
import { PlayedCard } from "../types/cards";
import { PreparedCard } from "../types/game";
import * as styles from "../styles/item-card.css";

// A card cannot turn over through the table, so it comes up to turn and
// goes back down after. These are how far, at the moment it is edge on.
const FLIP_SHADE_MAX = 0.3;
const FLIP_LIFT_SCALE = 0.085;
const FLIP_SHADOW_MAX = 0.9;

// "var(--name)" -> "--name", so a motion value can drive the variable.
const flipShadeProperty = styles.flipShadeVar.slice(4, -1);

// How squarely the card faces the viewer: 1 flat on, 0 edge on.
function facing(degrees: number) {
  return Math.abs(Math.cos((degrees * Math.PI) / 180));
}

type TransformValues = {
  rotateX?: number | number[];
  rotateY?: number | number[];
  scale?: number | number[];
  x?: number | number[];
  y?: number | number[];
  z?: number | number[];
};

type Props = {
  animateTransform?: TransformValues;
  backVariant?: "deck" | "fact";
  className?: string;
  flipped?: boolean;
  initialTransform?: false | TransformValues;
  item: PreparedCard | PlayedCard;
  /** 0 at rest, 1 held. Fades in the shadow of a card being carried. */
  lift?: MotionValue<number>;
  loadImage?: boolean;
  onAnimationComplete?: () => void;
  onClick?: () => void;
  revealDatePill?: boolean;
  surface?: "deck" | "timeline";
  style?: React.CSSProperties;
  transition?: Transition;
};

// A turn starts from rest, is quickest through edge on, and slows right
// down as the card is laid flat. It never overshoots: a card set down on a
// table cannot swing past flat.
const DEFAULT_TRANSITION: Transition = {
  duration: 0.6,
  ease: [0.5, 0, 0.15, 1],
};

// The date settles in with a touch of spring instead of a plain fade.
const DATE_PILL_TRANSITION: Transition = {
  damping: 22,
  mass: 0.6,
  opacity: { duration: 0.16, ease: "easeOut" },
  stiffness: 420,
  type: "spring",
};

export default function CardVisual(props: Props) {
  const {
    animateTransform,
    backVariant = "fact",
    className,
    flipped = false,
    initialTransform = false,
    item,
    lift,
    loadImage = true,
    onAnimationComplete,
    onClick,
    revealDatePill = true,
    surface = "timeline",
    style,
    transition = DEFAULT_TRANSITION,
  } = props;

  const imageCandidates = React.useMemo(
    () => (loadImage ? createWikimediaImageCandidates(item.image) : []),
    [item.image, loadImage],
  );
  const { imageSrc } = useCardImage(imageCandidates);
  const cardThemeStyle = useCardTheme(item.deckThemeHue);
  const yearLabel =
    item.year < 0 ? `${Math.abs(item.year)} BCE` : String(item.year);
  const effectiveAnimateTransform = animateTransform ?? {
    rotateY: flipped ? 180 : 0,
  };

  // Everything about the turn is read off the card's angle, so the lift,
  // the shadow and the shading can never drift out of step with it.
  const rotateY = useMotionValue(0);
  const edgeOn = useTransform(rotateY, (degrees) => 1 - facing(degrees));
  // Height follows a sine arc: up quickly, level at the top, down softly.
  const height = useTransform(edgeOn, (value) =>
    Math.sin((value * Math.PI) / 2),
  );
  const flipScale = useTransform(
    height,
    (value) => 1 + value * FLIP_LIFT_SCALE,
  );
  const flipShade = useTransform(edgeOn, (value) => value * FLIP_SHADE_MAX);
  const restingLift = useMotionValue(0);
  const carried = lift ?? restingLift;
  const shadowOpacity = useTransform(
    [carried, height],
    ([carriedValue, heightValue]: number[]) =>
      Math.max(carriedValue, heightValue * FLIP_SHADOW_MAX),
  );
  // The shadow is as wide as the card appears: a sliver when edge on.
  const shadowWidth = useTransform(edgeOn, (value) =>
    Math.max(1 - value, 0.06),
  );
  const flipStyle = EFFECTS.physicalFlip
    ? { [flipShadeProperty]: flipShade, rotateY, scale: flipScale }
    : {};

  return (
    <div
      className={classNames(styles.itemCard, className, {
        [styles.deckCard]: surface === "deck",
        [styles.played]: "played" in item,
        [styles.flipped]: flipped,
      })}
      onClick={onClick}
      style={{
        ...cardThemeStyle,
        ...style,
      }}
    >
      {/* Outside the 3D scene on purpose: inside it, the half of a turning
          card that swings away from the viewer would pass behind this. */}
      <motion.div
        aria-hidden="true"
        className={styles.liftShadow}
        style={{
          opacity: EFFECTS.physicalFlip ? shadowOpacity : carried,
          scaleX: EFFECTS.physicalFlip ? shadowWidth : 1,
        }}
      />
      <div className={styles.cardScene}>
        <motion.div
          animate={effectiveAnimateTransform}
          className={styles.cardFaces}
          initial={initialTransform}
          onAnimationComplete={onAnimationComplete}
          transition={transition}
          style={{ transformStyle: "preserve-3d", ...flipStyle }}
        >
          <div
            className={styles.front}
            style={{ pointerEvents: flipped ? "none" : "auto" }}
          >
            <div className={styles.cardContent}>
              <div className={styles.top}>
                <div className={styles.label}>{item.title}</div>
                <div className={styles.description}>{item.subtitle ?? ""}</div>
              </div>
              <div className={styles.image}>
                {imageSrc ? (
                  <div className={styles.imageFrame}>
                    <div className={styles.imageInner}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        className={styles.imageForeground}
                        crossOrigin="anonymous"
                        decoding="sync"
                        draggable={false}
                        loading="eager"
                        onContextMenu={(event) => {
                          event.preventDefault();
                        }}
                        src={imageSrc}
                      />
                      <div aria-hidden="true" className={styles.imageTint} />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div
            className={classNames(styles.back, {
              [styles.deckBack]: backVariant === "deck",
            })}
            style={{ pointerEvents: flipped ? "auto" : "none" }}
          >
            {backVariant === "deck" ? (
              <div className={styles.deckBackContent}>
                <div className={styles.deckBackMark}>W</div>
              </div>
            ) : (
              <div className={styles.cardContent}>
                <span className={styles.fact}>{item.fact}</span>
                <div className={styles.links}>
                  <a
                    href={`https://www.wikidata.org/wiki/${item.qid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    Wikidata
                  </a>
                  {item.wikipediaSlug ? (
                    <Fragment>
                      <span className={styles.linkSeparator}>/</span>
                      <a
                        href={`https://en.wikipedia.org/wiki/${item.wikipediaSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        Wikipedia
                      </a>
                    </Fragment>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      {"played" in item ? (
        <div className={styles.datePillAnchor}>
          <motion.div
            animate={{
              opacity: revealDatePill ? 1 : 0,
              scale: revealDatePill ? 1 : 0.92,
              y: revealDatePill ? 0 : 6,
            }}
            className={classNames(styles.datePill, {
              [styles.correct]: item.played.correct,
              [styles.incorrect]: !item.played.correct,
            })}
            initial={false}
            transition={DATE_PILL_TRANSITION}
          >
            <span>{yearLabel}</span>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
