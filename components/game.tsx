import React, { useState } from "react";
import moment from "moment";
import {
  DragDropContext,
  DropResult,
  FluidDragActions,
  SensorAPI,
  SnapDragActions,
} from "react-beautiful-dnd";
import { Item, PlayedItem } from "../types/item";
import NextItemList from "./next-item-list";
import PlayedItemList from "./played-item-list";
import styles from "../styles/game.module.scss";

function noop() {}

interface State {
  badlyPlacedIndex: number | null;
  badlyPlacedRendered: boolean;
  deck: Item[];
  loaded: boolean;
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

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function useAutoMoveSensor(state: State, api: SensorAPI) {
  console.log({ api, state });
  console.log("autoMoveSensor", state.badlyPlacedIndex);

  if (state.badlyPlacedIndex === null || state.badlyPlacedRendered === false) {
    console.log("abandon");
    return;
  }

  console.log("move id", state.played[state.badlyPlacedIndex].id);

  const preDrag = api.tryGetLock?.(
    state.played[state.badlyPlacedIndex].id,
    noop
  );
  console.log("move 1");

  if (!preDrag) {
    console.log("cant find or lock");
    return;
  }
  console.log("move 2");

  const drag = preDrag.snapLift();

  // drag.move({ x: 170 * delta, y: 0 });
  drag.moveRight();
  console.log("move 3");
  // await wait(moveDurationMs);
  drag.drop();
}

export default function Game() {
  const [state, setState] = useState<State>({
    badlyPlacedIndex: null,
    badlyPlacedRendered: false,
    deck: [],
    loaded: false,
    next: null,
    played: [],
  });

  function getRandomItem(deck: Item[], played: Item[]): Item {
    let next: Item;

    const playedYears = played.map((item): number => {
      return item.year;
    });

    let item: Item | undefined = undefined;

    while (item === undefined) {
      const index = Math.floor(Math.random() * deck.length);
      next = deck[index];
      const year = moment(next.date).year();

      if (playedYears.includes(year)) {
        continue;
      }

      deck.splice(index, 1);

      item = { ...next, year };
    }

    return item;
  }

  React.useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/items.json");
      const items = (await res.text()).trim().split("\n");
      // const deck: Item[] = items.slice(0, 0 + 100).map((line) => {
      console.time("json parse");
      const deck: Item[] = items.map((line) => {
        return JSON.parse(line);
      });
      console.timeEnd("json parse");
      const next = getRandomItem(deck, []);
      const played = [
        { ...getRandomItem(deck, []), played: { correct: true } },
      ];

      setState((state) => {
        return { ...state, next, deck, played, loaded: true };
      });
    };

    fetchData();
  }, []);

  async function onDragEnd(result: DropResult) {
    // debugger;
    const { source, destination } = result;
    console.log("onDragEnd", { source, destination });

    if (
      !destination ||
      state.next === null ||
      (source.droppableId === "next" && destination.droppableId === "next")
    ) {
      return;
    }

    const item = { ...state.next };

    if (source.droppableId === "next" && destination.droppableId === "played") {
      const newDeck = [...state.deck];
      const newPlayed = [...state.played];
      const newNext = getRandomItem(newDeck, newPlayed);

      const correct = checkCorrect(newPlayed, item, destination.index);
      newPlayed.splice(destination.index, 0, {
        ...state.next,
        played: { correct },
      });

      // setTimeout(async () => {
      //   await move(item.id, 1);
      // }, 2000);

      console.log("next to played");

      setState({
        ...state,
        deck: newDeck,
        next: newNext,
        played: newPlayed,
        badlyPlacedIndex: correct ? null : destination.index,
        badlyPlacedRendered: false,
      });
    } else if (
      source.droppableId === "played" &&
      destination.droppableId === "played"
    ) {
      console.log("played to played", ...state.played);
      console.log(`${source.index} to ${destination.index}`);

      const newPlayed = [...state.played];
      const [item] = newPlayed.splice(source.index, 1);
      newPlayed.splice(destination.index, 0, item);
      console.log("played to played end", newPlayed);

      setState({
        ...state,
        played: newPlayed,
        badlyPlacedIndex: null,
        badlyPlacedRendered: false,
      });
    }
  }

  React.useLayoutEffect(() => {
    if (state.badlyPlacedIndex !== null && !state.badlyPlacedRendered) {
      setState({ ...state, badlyPlacedRendered: true });
    }
  }, [state]);

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
          sensors={[useAutoMoveSensor.bind(null, state)]}
        >
          <div className={styles.wrapper}>
            <div className={styles.top}>
              <NextItemList next={state.next} />
            </div>
            <div className={styles.bottom}>
              <PlayedItemList
                badlyPlacedIndex={state.badlyPlacedIndex}
                items={state.played}
              />
            </div>
          </div>
        </DragDropContext>
      ) : (
        <h2>Loading</h2>
      )}
    </>
  );
}
