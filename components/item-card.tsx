import React from "react";
import classNames from "classnames";
import { useSpring, animated } from "react-spring";
import { Draggable } from "react-beautiful-dnd";
import { Item, PlayedItem } from "../types/item";
import { createWikimediaImage } from "../lib/image";
import styles from "../styles/item-card.module.scss";

interface Props {
  draggable?: boolean;
  flippedId?: null | string;
  index: number;
  item: Item | PlayedItem;
  played?: true;
  setFlippedId?: (flippedId: string | null) => void;
}

const datePropIdMap: { [datePropId: string]: string } = {
  P575: "discovery or invention",
  P7589: "assent",
  P577: "publication",
  P1191: "first performance",
  P1619: "official opening",
  P571: "creation",
  P1249: "earliest written record",
  P576: "end of",
  P8556: "extinction",
  P6949: "announcement",
  P1319: "earliest",
  P569: "birth",
  P570: "death",
  P582: "end",
  P580: "start",
  P7125: "latest one",
  P7124: "first one",
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ItemCard(props: Props) {
  const { draggable, flippedId, index, item, played, setFlippedId } = props;

  const flipped = item.id === flippedId;

  const { transform, opacity } = useSpring({
    opacity: flipped ? 1 : 0,
    transform: `perspective(600px) rotateY(${flipped ? 180 : 0}deg)`,
    config: { mass: 5, tension: 750, friction: 100 },
  });

  const fadeProps = useSpring({ opacity: 1, from: { opacity: 0 } });

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
      {(provided) => (
        <div
          className={classNames(styles.itemCard, {
            [styles.played]: played,
            [styles.flipped]: flipped,
          })}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => {
            if (played && setFlippedId) {
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
            style={{ opacity: opacity.to((o) => 1 - o), transform }}
          >
            <div className={styles.top}>
              <div className={styles.label}>{capitalize(item.label)}</div>
              <div className={styles.description}>{capitalize(type)}</div>
            </div>
            <div
              className={styles.bottom}
              style={{
                backgroundImage: `url("${createWikimediaImage(item.image)}")`,
              }}
            >
              {played ? (
                <animated.div style={fadeProps} className={styles.playedInfo}>
                  <span
                    className={classNames(styles.date, {
                      [styles.correct]: "played" in item && item.played.correct,
                      [styles.incorrect]:
                        "played" in item && !item.played.correct,
                    })}
                  >
                    {item.year < -10000
                      ? item.year.toLocaleString()
                      : item.year.toString()}
                  </span>
                </animated.div>
              ) : (
                <div className={styles.dateProp}>
                  {datePropIdMap[item.date_prop_id]}
                </div>
              )}
            </div>
          </animated.div>
          <animated.div
            className={styles.back}
            style={{
              opacity,
              transform: transform.to(
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
      )}
    </Draggable>
  );
}
