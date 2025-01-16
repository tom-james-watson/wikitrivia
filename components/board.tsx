import React, { useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { GameState } from "../types/game";
import useAutoMoveSensor from "../lib/useAutoMoveSensor";
import { checkCorrect } from "../lib/items";
import NextItemList from "./next-item-list";
import PlayedItemList from "./played-item-list";
import styles from "../styles/board.module.scss";
import Hearts from "./hearts";
import GameOver from "./game-over";
import Button from "./button";
import { Trans } from "@lingui/macro";

interface Props {
  highscore: number;
  initialState: GameState;
  updateHighscore: (score: number) => void;
  restart: (categoriesMode: boolean) => void;
}

export default function Board(props: Props) {
  const { highscore, initialState, updateHighscore, restart } = props;
  const [state, setState] = useState<GameState>(initialState);

  const [isDragging, setIsDragging] = React.useState(false);

  const playAgain = (toCategories: boolean) => {
    if (toCategories) {
      restart(true);
    } else {
      setState(initialState);
    }
  }

  async function onDragStart() {
    setIsDragging(true);
  }

  async function onDragEnd(result: DropResult) {
    setIsDragging(false);
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
      const { correct, delta } = checkCorrect(
        newPlayed,
        item,
        destination.index
      );
      newPlayed.splice(destination.index, 0, {
        ...state.next,
        played: { correct },
      });
      const randomIndex = Math.floor(Math.random() * newDeck.length);
      const newNext = newDeck[randomIndex]
      newDeck.splice(randomIndex, 1);

      setState({
        ...state,
        deck: newDeck,
        next: newNext,
        played: newPlayed,
        lives: correct ? state.lives : state.lives - 1,
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

  // Ensure that newly placed items are rendered as draggables before trying to
  // move them to the right place if needed.
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
  }, [setState, state]);

  const score = React.useMemo(() => {
    return state.played.filter((item) => item.played.correct).length - 1;
  }, [state.played]);

  React.useLayoutEffect(() => {
    if (score > highscore) {
      updateHighscore(score);
    }
  }, [score, highscore, updateHighscore]);

  return (
    <DragDropContext
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      sensors={[useAutoMoveSensor.bind(null, state)]}
    >
      <div className={styles.wrapper + " " + (isDragging ? "dragging" : "notDragging")}>
        <div className={styles.gameHeader}>
          <div className={styles.actionsContainer}>
            <Button onClick={() => restart(false)} small><Trans>Back</Trans></Button>
            <Button onClick={() => playAgain(false)} small minimal><Trans>Restart</Trans></Button>
          </div>
          <Hearts lives={state.lives} />
        </div>
        <div id="top" className={styles.top}>
          <PlayedItemList
            badlyPlacedIndex={
              state.badlyPlaced === null ? null : state.badlyPlaced.index
            }
            items={state.played}
          />
        </div>
        <div className={styles.bottom}>
          {state.lives > 0 && state.next ? (
            <>
              {/* We keep the container outside of the if so the space is still used when the arrow disappears and the bottom part doesn't move */}
              <div className={styles.arrowContainer}>
                {state.played.length === 1 &&
                  <img className={styles.arrow} src="images/arrow.svg" />
                }
              </div>
              <NextItemList next={state.next} />
            </>
          ) : (
            <GameOver
              highscore={highscore}
              resetGame={playAgain}
              score={score}
              lives={state.lives}
            />
          )}
        </div>
      </div>
    </DragDropContext>
  );
}
