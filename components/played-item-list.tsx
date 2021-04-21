import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { Item } from "../types/item";
import ItemCard from "./item-card";
import styles from "../styles/played-item-list.module.scss";

interface PlayedItemListProps {
  items: Item[];
}

export default function PlayedItemList(props: PlayedItemListProps) {
  const { items } = props;

  const [flippedId, setFlippedId] = React.useState<null | string>(null);

  return (
    <div className={styles.wrapper}>
      <div className={styles.listContainer}>
        <Droppable droppableId="played" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={styles.list}
            >
              <div className={styles.timelineContainer}>
                <div className={styles.timeline}></div>
              </div>
              <div className={styles.items}>
                {items.map((item, index) => (
                  <ItemCard
                    item={item}
                    index={index}
                    key={item.id}
                    played
                    flippedId={flippedId}
                    setFlippedId={setFlippedId}
                  />
                ))}
              </div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}
