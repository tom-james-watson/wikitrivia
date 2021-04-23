import React, { useState } from "react";
import * as tweenFunctions from "tween-functions";
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
  badlyPlaced: {
    index: number;
    rendered: boolean;
    delta: number;
  } | null;
  deck: Item[];
  loaded: boolean;
  next: Item | null;
  played: PlayedItem[];
}

function checkCorrect(
  played: PlayedItem[],
  item: Item,
  index: number
): { correct: boolean; delta: number } {
  const sorted = [...played, item].sort((a, b) => a.year - b.year);
  const correctIndex = sorted.findIndex((i) => {
    return i.id === item.id;
  });

  console.log({
    played: [...played],
    sorted,
    item,
    index,
    correctIndex,
    delta: correctIndex - index,
  });

  if (index !== correctIndex) {
    return { correct: false, delta: correctIndex - index };
  }

  return { correct: true, delta: 0 };
}

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function moveStepByStep(
  drag: FluidDragActions,
  values: { x: number; y: number }[]
) {
  requestAnimationFrame(() => {
    const newPosition = values.shift();

    if (newPosition === undefined) {
      drag.drop();
    } else {
      drag.move(newPosition);
      moveStepByStep(drag, values);
    }
  });
}

function useAutoMoveSensor(state: State, api: SensorAPI) {
  if (
    state.badlyPlaced === null ||
    state.badlyPlaced.index === null ||
    state.badlyPlaced.rendered === false
  ) {
    return;
  }

  const preDrag = api.tryGetLock?.(
    state.played[state.badlyPlaced.index].id,
    noop
  );

  if (!preDrag) {
    return;
  }

  const start = { x: 0, y: 0 };
  const end = { x: 170 * state.badlyPlaced.delta, y: 0 };

  const drag = preDrag.fluidLift(start);

  const points = [];

  const numberOfPoints = 20 * Math.abs(state.badlyPlaced.delta);

  for (let i = 0; i < numberOfPoints; i++) {
    points.push({
      x: tweenFunctions.easeOutCirc(i, start.x, end.x, numberOfPoints),
      y: tweenFunctions.easeOutCirc(i, start.y, end.y, numberOfPoints),
    });
  }

  moveStepByStep(drag, points);
}

export default function Game() {
  const [state, setState] = useState<State>({
    badlyPlaced: null,
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
    const { source, destination } = result;

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

      const { correct, delta } = checkCorrect(
        newPlayed,
        item,
        destination.index
      );
      newPlayed.splice(destination.index, 0, {
        ...state.next,
        played: { correct },
      });

      setState({
        ...state,
        deck: newDeck,
        next: newNext,
        played: newPlayed,
        badlyPlaced: correct
          ? null
          : {
              index: destination.index,
              rendered: false,
              delta,
            },
      });
    } else if (
      source.droppableId === "played" &&
      destination.droppableId === "played"
    ) {
      const newPlayed = [...state.played];
      const [item] = newPlayed.splice(source.index, 1);
      newPlayed.splice(destination.index, 0, item);

      setState({
        ...state,
        played: newPlayed,
        badlyPlaced: null,
      });
    }
  }

  React.useLayoutEffect(() => {
    if (
      state.badlyPlaced &&
      state.badlyPlaced.index !== null &&
      !state.badlyPlaced.rendered
    ) {
      setState({
        ...state,
        badlyPlaced: { ...state.badlyPlaced, rendered: true },
      });
    }
  }, [state]);

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
                badlyPlacedIndex={
                  state.badlyPlaced === null ? null : state.badlyPlaced.index
                }
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
