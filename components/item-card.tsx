import React from "react";
import classNames from "classnames";
import { useSpring, animated } from "react-spring";
import { Draggable } from "react-beautiful-dnd";
import { Item, PlayedItem } from "../types/item";
import { createWikimediaImage } from "../lib/image";
import styles from "../styles/item-card.module.scss";

type Props = {
  draggable?: boolean;
  flippedId?: null | string;
  index: number;
  item: Item | PlayedItem;
  setFlippedId?: (flippedId: string | null) => void;
};

const datePropIdMap: { [datePropId: string]: string } = {
  P575: "discovered", // or invented
  P7589: "date of assent",
  P577: "published",
  P1191: "first performed",
  P1619: "officially opened",
  P571: "created",
  P1249: "earliest record",
  P576: "ended",
  P8556: "became extinct",
  P6949: "announced",
  P1319: "earliest",
  P569: "born",
  P570: "died",
  P582: "ended",
  P580: "started",
  P7125: "latest one",
  P7124: "first one",
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ItemCard(props: Props) {
  const { draggable, flippedId, index, item, setFlippedId } = props;

  const flipped = item.id === flippedId;

  const cardSpring = useSpring({
    opacity: flipped ? 1 : 0,
    transform: `perspective(600px) rotateY(${flipped ? 180 : 0}deg)`,
    config: { mass: 5, tension: 750, friction: 100 },
  });

  const type = React.useMemo(() => {
    const safeDescription = item.description.replace(/ \(.+\)/g, "");

    if (item.description.length < 60 && !/\d\d/.test(safeDescription)) {
      return item.description.replace(/ \(.+\)/g, "");
    }

    if (item.instance_of.includes("human") && item.occupations !== null) {
      return item.occupations[0];
    }

    return item.instance_of[0];
  }, [item]);

  return (
    <Draggable draggableId={item.id} index={index} isDragDisabled={!draggable}>
      {(provided, snapshot) => {
        return (
          <div
            className={classNames(styles.itemCard, {
              [styles.played]: "played" in item,
              [styles.flipped]: flipped,
              [styles.dragging]: snapshot.isDragging,
            })}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => {
              if ("played" in item && setFlippedId) {
                if (flipped) {
                  setFlippedId(null);
                } else {
                  setFlippedId(item.id);
                }
              }
            }}
          >
            <animated.div
              className={styles.front}
              style={{
                opacity: cardSpring.opacity.to((o) => 1 - o),
                transform: cardSpring.transform,
              }}
            >
              <div className={styles.top}>
                <div className={styles.label}>{capitalize(item.label)}</div>
                <div className={styles.description}>{capitalize(type)}</div>
              </div>
              <div
                className={styles.image}
                style={{
                  backgroundImage: `url("${createWikimediaImage(item.image)}")`,
                }}
              ></div>
              <animated.div
                className={classNames(styles.bottom, {
                  [styles.correct]: "played" in item && item.played.correct,
                  [styles.incorrect]: "played" in item && !item.played.correct,
                })}
              >
                <span>
                  {"played" in item
                    ? item.year < -10000
                      ? item.year.toLocaleString()
                      : item.year.toString()
                    : datePropIdMap[item.date_prop_id]}
                </span>
              </animated.div>
            </animated.div>
            <animated.div
              className={styles.back}
              style={{
                opacity: cardSpring.opacity,
                transform: cardSpring.transform.to(
                  (t) => `${t} rotateX(180deg) rotateZ(180deg)`
                ),
              }}
            >
              <span className={styles.label}>{capitalize(item.label)}</span>
              <span className={styles.date}>
                {capitalize(datePropIdMap[item.date_prop_id])}: {item.year}
              </span>
              <span className={styles.description}>{item.description}.</span>
              <a
                href={`https://www.wikipedia.org/wiki/${encodeURIComponent(
                  item.wikipedia_title
                )}`}
                className={styles.wikipedia}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Wikipedia
              </a>
            </animated.div>
          </div>
        );
      }}
    </Draggable>
  );
}
