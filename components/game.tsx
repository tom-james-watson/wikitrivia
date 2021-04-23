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

interface State {
  loaded: boolean;
  deck: Item[];
  next: Item | null;
  played: PlayedItem[];
  badlyPlacedIndex: number | null;
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

export interface UseRbdCommandsProps {
  // isDragging: boolean;
  moveDurationMs?: number;
}

export const useRbdCommands = ({
  // isDragging,
  moveDurationMs = 200,
}: UseRbdCommandsProps): {
  useSensor: (api: SensorAPI) => void;
  move: (id: string, delta: number) => Promise<void>;
} => {
  const sensorApiRef = React.useRef<SensorAPI | null>(null);

  const useSensor = React.useCallback(
    (api: SensorAPI) => {
      console.log("set sensorApi");
      sensorApiRef.current = api;
    },
    [sensorApiRef]
  );

  const lift = React.useCallback(
    // (id: string): FluidDragActions | null => {
    (id: string): SnapDragActions | null => {
      // if (isDragging) {
      //   return null;
      // }

      console.log("lift", { id });

      const preDrag = sensorApiRef.current?.tryGetLock?.(id);

      if (!preDrag) {
        console.log("cant find or lock");
        return null;
      }

      //return preDrag.fluidLift({ x: 0, y: 0 });
      return preDrag.snapLift();
    },
    [sensorApiRef]
  );

  const move = React.useCallback(
    async (id: string, delta: number) => {
      const drag = lift(id);

      console.log("move 1");

      if (!drag) {
        return;
      }
      console.log("move 2");

      // drag.move({ x: 170 * delta, y: 0 });
      drag.moveRight();
      console.log("move 3");
      await wait(moveDurationMs);
      console.log("move 4");
      drag.drop();
      console.log("move 5");
    },
    [lift, moveDurationMs]
  );

  return {
    useSensor,
    move,
  };
};

export default function Game() {
  const [state, setState] = useState<State>({
    loaded: false,
    next: null,
    deck: [],
    played: [],
    badlyPlacedIndex: null,
  });

  const { useSensor, move } = useRbdCommands({
    // isDragging
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
      });
    } else if (
      source.droppableId === "played" &&
      destination.droppableId === "played"
    ) {
      console.log("played to played");
      const newPlayed = [...state.played];
      newPlayed.splice(
        destination.index,
        0,
        ...newPlayed.splice(source.index, 1)
      );

      setState({
        ...state,
        played: newPlayed,
        badlyPlacedIndex: null,
      });
    }
  }

  React.useEffect(() => {
    console.log("move changed");
  }, [move]);

  React.useLayoutEffect(() => {
    (async () => {
      console.log("layout effect");
      if (state.badlyPlacedIndex === null) {
        return;
      }

      // console.log("wait");
      // await wait(3000);
      console.log("do move", { badlyPlacedIndex: state.badlyPlacedIndex });

      await move(state.played[state.badlyPlacedIndex].id, 1);

      // setState({ ...state, badlyPlacedIndex: null });
    })();
  }, [move, state]);

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
          sensors={[useSensor]}
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
