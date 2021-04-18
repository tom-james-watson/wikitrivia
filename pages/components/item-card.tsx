import moment from "moment";
import { Draggable } from "react-beautiful-dnd";
import { Item } from "../../types/item";
import styles from "../../styles/item-card.module.scss";

interface Props {
  item: Item;
  index: number;
  played?: true;
}

export default function ItemCard(props: Props) {
  const { played, item, index } = props;

  return (
    <Draggable draggableId={item.id} index={index} isDragDisabled={played}>
      {(provided) => (
        <div
          className={styles.itemCard}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className={styles.label}>{item.label}</div>
          {item.types.length > 0 && (
            <div className={styles.types}>
              <span className={styles.type}>{item.types[0]}</span>
            </div>
          )}
          {played && (
            <div className={styles.played}>{moment(item.date).year()}</div>
          )}
        </div>
      )}
    </Draggable>
  );
}
