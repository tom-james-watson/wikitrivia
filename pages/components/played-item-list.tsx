import { Droppable } from "react-beautiful-dnd";
import { Item } from "../../types/item";
import ItemCard from "./item-card";
import styles from "../../styles/played-item-list.module.scss";

interface PlayedItemListProps {
  items: Item[];
}

export default function PlayedItemList(props: PlayedItemListProps) {
  const { items } = props;

  return (
    <div className={styles.container}>
      <Droppable droppableId="played" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={styles.list}
          >
            <div className={styles.items}>
              {items.map((item, index) => (
                <ItemCard item={item} index={index} key={item.id} played />
              ))}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
