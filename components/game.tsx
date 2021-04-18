import React, { useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { Item } from "../types/item";
import NextItemList from "./next-item-list";
import PlayedItemList from "./played-item-list";
import styles from "../styles/game.module.scss";

interface State {
  loaded: boolean;
  deck: Item[];
  next: Item | null;
  played: Item[];
}

export default function Game() {
  const [state, setState] = useState<State>({
    loaded: false,
    next: null,
    deck: [],
    played: [],
  });

  React.useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/items.json");
      const deck = (await res.text())
        .split("\n")
        .slice(0, 100)
        .map((line) => {
          return JSON.parse(line);
        });
      const next = deck.pop();
      const played = [deck.pop()];
      setState({ next, deck, played, loaded: true });
    };

    fetchData();
  }, []);

  function onDragEnd(result: DropResult) {
    // debugger;
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === "next" && destination.droppableId === "played") {
      const newDeck = [...state.deck];
      const newPlayed = [...state.played];
      const newNext = newDeck.pop() || null;
      newPlayed.splice(destination.index, 0, state.next as Item);

      setState({
        ...state,
        deck: newDeck,
        next: newNext,
        played: newPlayed,
      });
    }
  }

  console.log(state);

  return (
    <>
      {state.loaded ? (
        <DragDropContext
          onDragEnd={onDragEnd}
          onDragUpdate={() => {
            setTimeout(() => {
              // debugger;
            }, 1000);
          }}
        >
          <div className={styles.wrapper}>
            <div className={styles.top}>
              <NextItemList next={state.next} />
            </div>
            <div className={styles.bottom}>
              <PlayedItemList items={state.played} />
            </div>
          </div>
        </DragDropContext>
      ) : (
        <h2>Loading</h2>
      )}
    </>
  );
}
