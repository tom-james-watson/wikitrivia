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
import useWindowSize from "./useWindowSize";

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
      // console.log({ newPosition });
      bottom.scrollLeft = newScroll;
      // console.log(bottom.scrollLeft);
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

  const preDrag = api.tryGetLock?.(
    state.played[state.badlyPlaced.index].id,
    noop
  );

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

  // const bottomElLeft = bottomEl.scrollLeft;
  // const bottomElRight = bottomEl.scrollLeft + bottomEl.clientWidth;
  // const bottomElThirdWidth = bottomEl.clientWidth / 3;
  const bottomElCentreLeft = bottomEl.scrollLeft + bottomEl.clientWidth / 3;
  const bottomElCentreRight =
    bottomEl.scrollLeft + (bottomEl.clientWidth / 3) * 2;

  let distance = 0;

  if (
    destEl.offsetLeft < bottomElCentreLeft ||
    destEl.offsetLeft > bottomElCentreRight
  ) {
    // Destination is not in centre third of the screen.
    // Calculate distance to cover

    distance =
      destEl.offsetLeft < bottomElCentreLeft
        ? destEl.offsetLeft - bottomElCentreLeft
        : destEl.offsetLeft - bottomElCentreRight;

    console.log({
      distance,
      width: bottomEl.clientWidth,
      current: bottomEl.scrollLeft,
      future: bottomEl.scrollLeft + distance,
    });

    if (bottomEl.scrollLeft + distance < 0) {
      distance = -bottomEl.scrollLeft;
    } else if (
      bottomEl.scrollLeft + distance >
      bottomEl.scrollWidth - bottomEl.clientWidth
    ) {
      distance =
        bottomEl.scrollWidth - bottomEl.clientWidth - bottomEl.scrollLeft;
    }

    console.log({
      distance,
      width: bottomEl.clientWidth,
      current: bottomEl.scrollLeft,
      future: bottomEl.scrollLeft + distance,
    });
  }

  // const destOnScreen = destEl.offsetWidth;
  // bottomEl.scrollLeft;
  // bottomEl.clientWidth;

  // console.log(itemEl.offsetLeft);

  // console.log({ destEl });
  // console.log(destEl.offsetLeft);

  // destEl.scrollIntoView({ inline: "center", behavior: "smooth" });

  // await wait(1000);

  // console.log(itemEl.offsetLeft);
  // console.log(destEl.offsetLeft);

  const moveDistance = destEl.offsetLeft - itemEl.offsetLeft - distance;

  const drag = preDrag.fluidLift({ x: 0, y: 0 });

  const transformPoints = [];
  const scrollPoints = [];

  const numberOfPoints = 10 * Math.abs(state.badlyPlaced.delta);

  console.log({
    moveDistance,
  });

  for (let i = 0; i < numberOfPoints; i++) {
    transformPoints.push(
      tweenFunctions.easeOutCirc(i, 0, moveDistance, numberOfPoints)
    );
    scrollPoints.push(
      tweenFunctions.easeOutCirc(
        i,
        bottomEl.scrollLeft,
        bottomEl.scrollLeft + distance,
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
  const size = useWindowSize();

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
      // const played = [
      //   { ...getRandomItem(deck, []), played: { correct: true } },
      // ];
      const played: PlayedItem[] = [];
      for (let x = 0; x < 10; x++) {
        played.push({ ...getRandomItem(deck, []), played: { correct: true } });
      }
      played.sort((a, b) => a.year - b.year);

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
