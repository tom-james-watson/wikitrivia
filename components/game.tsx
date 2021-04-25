import React, { useState } from "react";
import * as tweenFunctions from "tween-functions";
import {
  DragDropContext,
  DropResult,
  FluidDragActions,
  SensorAPI,
} from "react-beautiful-dnd";
import { Item, PlayedItem } from "../types/item";
import NextItemList from "./next-item-list";
import PlayedItemList from "./played-item-list";
import styles from "../styles/game.module.scss";

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

  if (index !== correctIndex) {
    return { correct: false, delta: correctIndex - index };
  }

  return { correct: true, delta: 0 };
}

function moveStepByStep(
  drag: FluidDragActions,
  transformValues: number[],
  scrollValues: number[]
) {
  requestAnimationFrame(() => {
    const bottom = document.getElementById("bottom");

    if (bottom === null) {
      throw new Error("Can't find #bottom");
    }

    const newPosition = transformValues.shift();
    const newScroll = scrollValues.shift();

    if (newPosition === undefined || newScroll === undefined) {
      drag.drop();
    } else {
      bottom.scrollLeft = newScroll;
      drag.move({ x: newPosition, y: 0 });
      moveStepByStep(drag, transformValues, scrollValues);
    }
  });
}

async function useAutoMoveSensor(state: State, api: SensorAPI) {
  if (
    state.badlyPlaced === null ||
    state.badlyPlaced.index === null ||
    state.badlyPlaced.rendered === false
  ) {
    return;
  }

  const preDrag = api.tryGetLock?.(state.played[state.badlyPlaced.index].id);

  if (!preDrag) {
    return;
  }

  const itemEl: HTMLElement | null = document.querySelector(
    `[data-rbd-draggable-id='${state.played[state.badlyPlaced.index].id}']`
  );
  const destEl: HTMLElement | null = document.querySelector(
    `[data-rbd-draggable-id='${
      state.played[state.badlyPlaced.index + state.badlyPlaced.delta].id
    }']`
  );
  const bottomEl: HTMLElement | null = document.getElementById("bottom");

  if (itemEl === null || destEl === null || bottomEl === null) {
    throw new Error("Can't find element");
  }

  const bottomElCentreLeft = bottomEl.scrollLeft + bottomEl.clientWidth / 4;
  const bottomElCentreRight =
    bottomEl.scrollLeft + (bottomEl.clientWidth / 4) * 3 - itemEl.clientWidth;

  let scrollDistance = 0;

  if (
    destEl.offsetLeft < bottomElCentreLeft ||
    destEl.offsetLeft > bottomElCentreRight
  ) {
    // Destination is not in middle two quarters of the screen. Calculate
    // distance we therefore need to scroll.
    scrollDistance =
      destEl.offsetLeft < bottomElCentreLeft
        ? destEl.offsetLeft - bottomElCentreLeft
        : destEl.offsetLeft - bottomElCentreRight;

    if (bottomEl.scrollLeft + scrollDistance < 0) {
      scrollDistance = -bottomEl.scrollLeft;
    } else if (
      bottomEl.scrollLeft + scrollDistance >
      bottomEl.scrollWidth - bottomEl.clientWidth
    ) {
      scrollDistance =
        bottomEl.scrollWidth - bottomEl.clientWidth - bottomEl.scrollLeft;
    }
  }

  // Calculate the distance we need to move the item after taking into account
  // how far we are scrolling.
  const transformDistance =
    destEl.offsetLeft - itemEl.offsetLeft - scrollDistance;

  const drag = preDrag.fluidLift({ x: 0, y: 0 });

  // Create a series of eased transformations and scrolls to animate from the
  // current state to the desired state.
  const transformPoints = [];
  const scrollPoints = [];
  const numberOfPoints = 30 + 5 * Math.abs(state.badlyPlaced.delta);

  for (let i = 0; i < numberOfPoints; i++) {
    transformPoints.push(
      tweenFunctions.easeOutCirc(i, 0, transformDistance, numberOfPoints)
    );
    scrollPoints.push(
      tweenFunctions.easeOutCirc(
        i,
        bottomEl.scrollLeft,
        bottomEl.scrollLeft + scrollDistance,
        numberOfPoints
      )
    );
  }

  moveStepByStep(drag, transformPoints, scrollPoints);
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
    const playedYears = played.map((item): number => {
      return item.year;
    });
    console.log({ playedYears });
    let item: Item | undefined = undefined;
    let iterations = 0;

    const periods: [number, number][] = [
      [-100000, 1000],
      [1000, 1800],
      [1800, 1920],
      [1920, 1960],
      [1960, 2020],
    ];
    const [fromYear, toYear] = periods[
      Math.floor(Math.random() * periods.length)
    ];

    while (item === undefined) {
      iterations += 1;

      if (iterations > 1000) {
        throw new Error(`Couldn't find item after ${iterations} iterations`);
      }

      const index = Math.floor(Math.random() * deck.length);
      const candidate = deck[index];

      if (candidate.year < fromYear || candidate.year > toYear) {
        continue;
      }

      if (playedYears.includes(candidate.year)) {
        continue;
      }

      deck.splice(index, 1);
      item = { ...candidate };
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
            <div id="bottom" className={styles.bottom}>
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
