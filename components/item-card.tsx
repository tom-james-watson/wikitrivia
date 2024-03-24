import React from "react";
import classNames from "classnames";
import { Draggable } from "react-beautiful-dnd";
import { Item, PlayedItem } from "../types/item";
import styles from "../styles/item-card.module.scss";
import { round2 } from "../lib/items";
import ExplanationDialog from "./explanation-dialog";

type Props = {
  draggable?: boolean;
  index: number;
  item: Item | PlayedItem;
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ItemCard(props: Props) {
  const { draggable, index, item } = props;
  const [showExplanation, setShowExplanation] = React.useState<boolean>(false);

  return (<>
    <Draggable draggableId={item.id} index={index} isDragDisabled={!draggable}>
      {(provided, snapshot) => {
        return (
          <div
            className={classNames(styles.itemCard, {
              [styles.played]: "played" in item,
              [styles.dragging]: snapshot.isDragging,
            })}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => {
              if ("played" in item) {
                setShowExplanation(true);
              }
            }}
          >
            <div className={styles.front}>
              <header className={styles.top}>
                <h2 className={styles.label}>{capitalize(item.label)}</h2>
              </header>
              <main
                // className={styles.image}
                // style={{
                //   backgroundImage: `url("${item.image}")`,
                // }}
                dangerouslySetInnerHTML={{__html: item.description}}
              >
              </main>
              <div
                className={classNames(styles.bottom, {
                  [styles.correct]: "played" in item && item.played.correct,
                  [styles.incorrect]: "played" in item && !item.played.correct,
                })}
              >
                <span>
                  {"played" in item ? round2(item.source.ecv) : "?"} kg CO<sub>2</sub>
                </span>
              </div>
            </div>
          </div>
        );
      }}
    </Draggable>
    {showExplanation && <ExplanationDialog item={item} onExit={() => setShowExplanation(false)} />}
  </>);
}
