import React, { useState } from "react";
import moment from "moment";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { Item, PlayedItem } from "../types/item";
import NextItemList from "./next-item-list";
import PlayedItemList from "./played-item-list";
import styles from "../styles/game.module.scss";

interface State {
  loaded: boolean;
  deck: Item[];
  next: Item | null;
  played: PlayedItem[];
}

function checkCorrect(
  played: PlayedItem[],
  item: Item,
  index: number
): boolean {
  if (index > 0 && item.year <= played[index - 1].year) {
    return false;
  }

  if (index < played.length && item.year >= played[index].year) {
    return false;
  }

  return true;
}

export default function Game() {
  const [state, setState] = useState<State>({
    loaded: false,
    next: null,
    deck: [],
    played: [],
  });

  function getRandomItem(deck: Item[], played: Item[]): Item {
    let next: Item;

    const playedYears = played.map((item): number => {
      return item.year;
    });

    while (true) {
      const index = Math.floor(Math.random() * deck.length);
      next = deck[index];
      const year = moment(next.date).year();

      if (playedYears.includes(year)) {
        continue;
      }

      deck.splice(index, 1);

      return { ...next, year };
    }
  }

  React.useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/items.json");
      const items = (await res.text()).split("\n");
      const deck: Item[] = items.slice(0, 0 + 100).map((line) => {
        return JSON.parse(line);
      });
      const next = getRandomItem(deck, []);
      const played = [
        { ...getRandomItem(deck, []), played: { correct: true } },
      ];

      setState({ next, deck, played, loaded: true });
    };

    fetchData();
  }, []);

  function onDragEnd(result: DropResult) {
    // debugger;
    const { source, destination } = result;

    if (!destination || state.next === null) {
      return;
    }

    if (source.droppableId === "next" && destination.droppableId === "played") {
      const newDeck = [...state.deck];
      const newPlayed = [...state.played];
      const newNext = getRandomItem(newDeck, newPlayed);

      const correct = checkCorrect(newPlayed, state.next, destination.index);
      newPlayed.splice(destination.index, 0, {
        ...state.next,
        played: { correct },
      });

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
