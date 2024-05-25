import React from "react";
import classNames from "classnames";
import { Draggable } from "react-beautiful-dnd";
import { Item, PlayedItem } from "../types/item";
import ExplanationDialog from "./explanation-dialog";
import styles from "../styles/draggable-item-card.module.scss";
import ItemCard from "./item-card";

type Props = {
  draggable?: boolean;
  index: number;
  item: Item | PlayedItem;
};

export default function DraggableItemCard(props: Props) {
  const { draggable, index, item } = props;
  const [showExplanation, setShowExplanation] = React.useState<boolean>(false);

  return (<>
    <Draggable draggableId={item.id} index={index} isDragDisabled={!draggable}>
      {(provided, snapshot) => {
        return (
          <div
            className={classNames(
              styles.itemCard,
            {
              [styles.dragging]: snapshot.isDragging,
            }) + " " + ("played" in item && "played")}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => {
              if ("played" in item) {
                setShowExplanation(true);
              }
            }}
          >
            <div className="clickInterrogation">?</div>
            <ItemCard item={item} />
            <div className="hoverInterrogation">
              <div>?</div>
            </div>
          </div>
        );
      }}
    </Draggable>
    {showExplanation && <ExplanationDialog item={item} onExit={() => setShowExplanation(false)} />}
  </>);
}
