import moment from "moment";
import classNames from "classnames";
import { useSpring, animated } from "react-spring";
import { Draggable } from "react-beautiful-dnd";
import { Item } from "../types/item";
import styles from "../styles/item-card.module.scss";

interface Props {
  item: Item;
  index: number;
  played?: true;
}

const datePropIdMap: { [datePropId: string]: string } = {
  P575: "time of discovery or invention",
  P7589: "date of assent",
  P577: "publication date",
  P1191: "date of first performance",
  P1619: "date of official opening",
  P571: "creation or founding of",
  P1249: "time of earliest written record",
  P576: "abolished or demolished date",
  P8556: "extinction date",
  P6949: "announcement date",
  P1319: "earliest date",
  P570: "date of death",
  P582: "end time",
  P580: "start time",
  P7125: "date of the latest one",
  P7124: "date of the first one",
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

export default function ItemCard(props: Props) {
  const { played, item, index } = props;

  const springProps = useSpring({ opacity: 1, from: { opacity: 0 } });

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
          className={classNames(styles.itemCard, { [styles.played]: played })}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <span className={styles.title}>
            <span className={styles.label}>{item.label}</span>
          </span>
          {item.types.length > 0 && (
            <div className={styles.types}>
              <span className={styles.type}>{item.types[0]}</span>
            </div>
          )}
          <div className={styles.img} /*style={{ backgroundImage: imgUrl }}*/>
            {played ? (
              <animated.div style={springProps} className={styles.playedInfo}>
                <div className={styles.description}>{item.description}</div>
                <span className={styles.date}>{yearStr}</span>
              </animated.div>
            ) : (
              <div className={styles.dateProp}>
                {datePropIdMap[item.date_prop_id]}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
