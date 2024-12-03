import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { Item } from "../types/item";
import DraggableItemCard from "./draggable-item-card";
import styles from "../styles/played-item-list.module.scss";

interface PlayedItemListProps {
  badlyPlacedIndex: number | null;
  items: Item[];
}

export default function PlayedItemList(props: PlayedItemListProps) {
  const { badlyPlacedIndex, items } = props;

  return (
    <div className={styles.listContainer}>
      <Droppable droppableId="played" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={styles.items}
          >
            <div className={styles.emptyItem + " bordered-area"}>-</div>
            {items.map((item, index) => (
              <DraggableItemCard
                draggable={badlyPlacedIndex !== null}
                index={index}
                item={item}
                key={item.id}
              />
            ))}
            {provided.placeholder}
            <div className={styles.emptyItem + " bordered-area"}>+</div>
          </div>
        )}
      </Droppable>
    </div>
  );
}
