import React from "react";
import moment from "moment";
import classNames from "classnames";
import { useSpring, animated } from "react-spring";
import { Draggable } from "react-beautiful-dnd";
import { Item } from "../types/item";
import styles from "../styles/item-card.module.scss";

interface Props {
  flippedId?: null | string;
  index: number;
  item: Item;
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
  P570: "death",
  P582: "end",
  P580: "start",
  P7125: "latest one",
  P7124: "first one",
};

const datePropIdMap2: { [datePropId: string]: string } = {
  P575: "Discovery or invention of",
  P7589: "Assent of ",
  P577: "Publication of",
  P1191: "First performance of",
  P1619: "Official opening of",
  P571: "Creation of",
  P1249: "Earliest written record of",
  P576: "Abolishing or demolishing of",
  P8556: "Extinction of",
  P6949: "Announcement of",
  P1319: "Earliest record of",
  P570: "Death of",
  P582: "End of",
  P580: "Start of",
  P7125: "Date of latest",
  P7124: "Date of first",
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ItemCard(props: Props) {
  const { flippedId, index, item, played, setFlippedId } = props;

  const flipped = item.id === flippedId;

  const { transform, opacity } = useSpring({
    opacity: flipped ? 1 : 0,
    transform: `perspective(600px) rotateY(${flipped ? 180 : 0}deg)`,
    config: { mass: 5, tension: 750, friction: 100 },
  });

  const fadeProps = useSpring({ opacity: 1, from: { opacity: 0 } });

  const imgUrl = item.image
    ? `url(https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(
        item.image
      )}&width=300)`
    : undefined;

  item.date_prop_id;

  const year = moment(item.date).year();

  const yearStr = year < -10000 ? year.toLocaleString() : year.toString();

  return (
    <Draggable draggableId={item.id} index={index} isDragDisabled={played}>
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
              <span className={styles.label}>{capitalize(item.label)}</span>
              {item.types.length > 0 && (
                <div className={styles.types}>
                  <span className={styles.type}>{item.types[0]}</span>
                </div>
              )}
            </div>
            <div className={styles.bottom} style={{ backgroundImage: imgUrl }}>
              {played ? (
                <animated.div style={fadeProps} className={styles.playedInfo}>
                  <span className={styles.date}>{yearStr}</span>
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
            <span className={styles.description}>{item.description}.</span>
            <a
              href={`https://www.wikipedia.org/wiki/${encodeURIComponent(
                item.wikipedia
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
