import classNames from "classnames";
import { motion, Transition } from "motion/react";
import React, { Fragment } from "react";
import { createWikimediaImageCandidates } from "../lib/image";
import { useCardImage } from "../lib/use-card-image";
import { useCardTheme } from "../lib/use-card-theme";
import { PlayedCard } from "../types/cards";
import { PreparedCard } from "../types/game";
import * as styles from "../styles/item-card.css";

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
  loadImage?: boolean;
  onAnimationComplete?: () => void;
  onClick?: () => void;
  revealDatePill?: boolean;
  surface?: "deck" | "timeline";
  style?: React.CSSProperties;
  transition?: Transition;
};

const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  stiffness: 340,
  damping: 28,
  mass: 1,
};

export default function CardVisual(props: Props) {
  const {
    animateTransform,
    backVariant = "fact",
    className,
    flipped = false,
    initialTransform = false,
    item,
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
      <div className={styles.cardScene}>
        <motion.div
          animate={effectiveAnimateTransform}
          className={styles.cardFaces}
          initial={initialTransform}
          onAnimationComplete={onAnimationComplete}
          transition={transition}
          style={{ transformStyle: "preserve-3d" }}
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
        {"played" in item ? (
          <div className={styles.datePillAnchor}>
            <motion.div
              animate={{
                opacity: revealDatePill ? 1 : 0,
                y: revealDatePill ? 0 : 6,
              }}
              className={classNames(styles.datePill, {
                [styles.correct]: item.played.correct,
                [styles.incorrect]: !item.played.correct,
              })}
              initial={false}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <span>{yearLabel}</span>
            </motion.div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
