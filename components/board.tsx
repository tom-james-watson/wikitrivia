import classNames from "classnames";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import {
  checkCorrect,
  drawNextCard,
  preloadImage,
} from "../lib/game-selection";
import {
  createPlacementAnimationState,
  PlacementAnimationState,
  PlacementRequest,
} from "../lib/placement-animation";
import { GameDifficulty, GameState } from "../types/game";
import { PreparedCard } from "../types/game";
import { GameMode, SelectionRoute } from "../types/routes";
import DealAnimationLayer from "./deal-animation-layer";
import GameOver from "./game-over";
import Lives from "./lives";
import NextItemList from "./next-item-list";
import PlacementAnimationLayer from "./placement-animation-layer";
import PlayedItemList from "./played-item-list";
import * as styles from "../styles/board.css";

const DEAL_REVEAL_DELAY_MS = 120;
const DEAL_REVEAL_DURATION_MS = 760;
const GAME_OVER_FADE_DURATION_MS = 280;
const GAME_OVER_LINGER_DURATION_MS = 750;
const OPENING_DEAL_DELAY_MS = 500;
const OPENING_DEAL_DURATION_MS = 820;
const EDGE_SCROLL_THRESHOLD = 36;
const EDGE_SCROLL_MAX_STEP = 10;

function clampEdgeScrollProgress(progress: number) {
  return Math.max(0, Math.min(1, progress));
}

interface Props {
  dailyDateKey?: string;
  difficulty: GameDifficulty;
  gameMode: GameMode;
  highscore: number;
  resetGame?: () => void;
  restoredFromSnapshot?: boolean;
  routePath: string;
  selectionRoute?: SelectionRoute;
  state: GameState;
  setState: (state: GameState) => void;
  updateHighscore: (score: number) => void;
}

interface FrozenDeckState {
  deckState: "hidden" | "ready" | "revealing";
  next: PreparedCard | null;
  reserve: PreparedCard | null;
}

export default function Board(props: Props) {
  const {
    dailyDateKey,
    difficulty,
    gameMode,
    highscore,
    resetGame,
    restoredFromSnapshot = false,
    routePath,
    selectionRoute,
    state,
    setState,
    updateHighscore,
  } = props;

  const [isDragging, setIsDragging] = React.useState(false);
  const [deckState, setDeckState] = React.useState<
    "hidden" | "ready" | "revealing"
  >("hidden");
  const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);
  const [openingDealInFlight, setOpeningDealInFlight] = React.useState(false);
  const [frozenDeckState, setFrozenDeckState] =
    React.useState<FrozenDeckState | null>(null);
  const [openingDeal, setOpeningDeal] = React.useState<null | {
    card: PreparedCard;
    from: {
      x: number;
      y: number;
    };
    to: {
      x: number;
      y: number;
    };
  }>(null);
  const [pendingPlacement, setPendingPlacement] =
    React.useState<PlacementRequest | null>(null);
  const [pendingResolvedState, setPendingResolvedState] =
    React.useState<GameState | null>(null);
  const [placementAnimation, setPlacementAnimation] =
    React.useState<PlacementAnimationState | null>(null);
  const [gameOverPhase, setGameOverPhase] = React.useState<
    "hud-exit" | "linger" | "playing" | "summary"
  >("playing");
  const [hiddenPlayedCardId, setHiddenPlayedCardId] = React.useState<
    null | string
  >(null);
  const boardRef = React.useRef<HTMLDivElement | null>(null);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const deckAnchorRef = React.useRef<HTMLDivElement | null>(null);
  const openingAnchorRef = React.useRef<HTMLDivElement | null>(null);
  const [anchorVersion, setAnchorVersion] = React.useState(0);
  const dragDirectionRef = React.useRef<-1 | 0 | 1>(0);
  const lastDragCentreXRef = React.useRef<number | null>(null);
  const previousNextIdRef = React.useRef<string | null>(null);
  const previewIndexRef = React.useRef<number | null>(null);
  const isPlacementSettling =
    pendingPlacement !== null || placementAnimation !== null;
  const isDeckExhausted = state.next === null;
  const showLives = state.lives > 0 && !isDeckExhausted;
  const showGameOverSummary = gameOverPhase === "summary";
  const showLivesScene = showLives || !showGameOverSummary;
  const statusScene = showGameOverSummary ? "game-over" : "lives";
  const deckShown =
    showLives ||
    gameOverPhase === "linger" ||
    openingDealInFlight ||
    openingDeal !== null;
  const queuedDeckState = pendingResolvedState
    ? {
        next: pendingResolvedState.next,
        reserve: pendingResolvedState.nextButOne,
      }
    : null;
  const deckVisible =
    showLives ||
    gameOverPhase === "linger" ||
    gameOverPhase === "hud-exit" ||
    openingDealInFlight ||
    openingDeal !== null;
  const renderedDeckState =
    frozenDeckState &&
    (gameOverPhase === "linger" || gameOverPhase === "hud-exit")
      ? frozenDeckState
      : {
          deckState,
          next:
            isPlacementSettling && queuedDeckState
              ? queuedDeckState.next
              : state.next,
          reserve:
            isPlacementSettling && queuedDeckState
              ? queuedDeckState.reserve
              : state.nextButOne,
        };
  const timelineLayoutAnimationsEnabled =
    placementAnimation === null && showLives;
  const nextPlacementIndex = React.useMemo(() => {
    return (
      state.played.reduce((maxPlacementIndex, card, index) => {
        return Math.max(maxPlacementIndex, card.played.placementIndex ?? index);
      }, -1) + 1
    );
  }, [state.played]);

  const commitPlacedCard = React.useCallback(
    (card: PreparedCard) => {
      const promotedCard = state.nextButOne;
      const nextState: GameState = {
        ...state,
        imageCache: [],
        next: null,
        nextButOne: null,
        played: [
          ...state.played,
          {
            ...card,
            played: {
              correct: true,
              justPlaced: false,
              placementIndex: nextPlacementIndex,
              showDate: false,
            },
          },
        ],
        recentDeckIds: [...state.recentDeckIds],
        usedQids: new Set(state.usedQids),
        usedYears: new Set(state.usedYears),
      };
      const upcomingCard = drawNextCard(nextState);
      const imageCache = [
        promotedCard ? preloadImage(promotedCard.image) : null,
        upcomingCard ? preloadImage(upcomingCard.image) : null,
      ].filter((image): image is HTMLImageElement => image !== null);

      setDeckState("hidden");
      setState({
        ...nextState,
        imageCache,
        next: promotedCard,
        nextButOne: upcomingCard,
      });
    },
    [nextPlacementIndex, setState, state],
  );

  const handleDeckAnchorChange = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (deckAnchorRef.current !== node) {
        deckAnchorRef.current = node;
        setAnchorVersion((currentValue) => currentValue + 1);
      }
    },
    [],
  );

  const handleOpeningAnchorChange = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (openingAnchorRef.current !== node) {
        openingAnchorRef.current = node;
        setAnchorVersion((currentValue) => currentValue + 1);
      }
    },
    [],
  );

  function getProjectedDropIndex(
    point: {
      x: number;
      y: number;
    },
    rect?: DOMRect | null,
  ): number | null {
    const bottomEl = bottomRef.current;
    if (!bottomEl) {
      return null;
    }

    const bottomRect = bottomEl.getBoundingClientRect();
    const probeY = rect ? rect.top + rect.height / 2 : point.y;
    if (probeY < bottomRect.top - 100 || probeY > bottomRect.bottom + 60) {
      return null;
    }

    let probeX = point.x;

    if (rect) {
      if (dragDirectionRef.current > 0) {
        probeX = rect.right;
      } else if (dragDirectionRef.current < 0) {
        probeX = rect.left;
      } else {
        probeX = rect.left + rect.width / 2;
      }
    }

    const playedItemEls = Array.from(
      bottomEl.querySelectorAll<HTMLElement>("[data-card-id]"),
    );
    if (playedItemEls.length === 0) {
      return 0;
    }

    for (let index = 0; index < playedItemEls.length; index += 1) {
      const itemRect = playedItemEls[index].getBoundingClientRect();
      const itemThreshold =
        dragDirectionRef.current > 0
          ? itemRect.left + itemRect.width * 0.75
          : dragDirectionRef.current < 0
            ? itemRect.left + itemRect.width * 0.25
            : itemRect.left + itemRect.width / 2;

      if (probeX < itemThreshold) {
        return index;
      }
    }

    return playedItemEls.length;
  }

  function maybeAutoScrollDuringDrag(
    point: { x: number; y: number },
    rect?: DOMRect | null,
  ) {
    const bottomEl = bottomRef.current;
    if (!bottomEl) {
      return;
    }

    const leftEdge = rect?.left ?? point.x;
    const rightEdge = rect?.right ?? point.x;
    let scrollDelta = 0;

    if (leftEdge < EDGE_SCROLL_THRESHOLD) {
      const progress = clampEdgeScrollProgress(
        1 - leftEdge / EDGE_SCROLL_THRESHOLD,
      );
      scrollDelta = -Math.ceil(progress * EDGE_SCROLL_MAX_STEP);
    } else if (rightEdge > window.innerWidth - EDGE_SCROLL_THRESHOLD) {
      const progress = clampEdgeScrollProgress(
        (rightEdge - (window.innerWidth - EDGE_SCROLL_THRESHOLD)) /
          EDGE_SCROLL_THRESHOLD,
      );
      scrollDelta = Math.ceil(progress * EDGE_SCROLL_MAX_STEP);
    }

    if (scrollDelta === 0) {
      return;
    }

    bottomEl.scrollLeft = Math.max(
      0,
      Math.min(
        bottomEl.scrollWidth - bottomEl.clientWidth,
        bottomEl.scrollLeft + scrollDelta,
      ),
    );
  }

  function onCardDragStart(
    point: { x: number; y: number },
    rect: DOMRect | null,
  ) {
    setIsDragging(true);
    dragDirectionRef.current = 0;
    lastDragCentreXRef.current = rect ? rect.left + rect.width / 2 : point.x;
    const nextPreviewIndex = getProjectedDropIndex(point, rect);
    previewIndexRef.current = nextPreviewIndex;
    setPreviewIndex(nextPreviewIndex);
    navigator.vibrate?.(20);
  }

  const updatePreviewIndex = React.useCallback(
    (nextPreviewIndex: number | null) => {
      if (previewIndexRef.current === nextPreviewIndex) {
        return;
      }

      previewIndexRef.current = nextPreviewIndex;
      setPreviewIndex(nextPreviewIndex);
    },
    [],
  );

  function commitDeckDrop(
    card: PreparedCard,
    droppedIndex: number,
    rect: DOMRect,
  ) {
    const newPlayed = [...state.played];
    const { correct, delta } = checkCorrect(newPlayed, card, droppedIndex);
    const finalIndex = correct ? droppedIndex : droppedIndex + delta;

    newPlayed.splice(finalIndex, 0, {
      ...card,
      played: {
        correct,
        justPlaced: false,
        placementIndex: nextPlacementIndex,
        showDate: false,
      },
    });

    const newNext = state.nextButOne;
    const nextState: GameState = {
      ...state,
      imageCache: [],
      next: null,
      nextButOne: null,
      played: newPlayed,
      recentDeckIds: [...state.recentDeckIds],
      usedQids: new Set(state.usedQids),
      usedYears: new Set(state.usedYears),
      badlyPlaced: null,
    };
    const newNextButOne = drawNextCard(nextState);
    const newImageCache = [
      newNext ? preloadImage(newNext.image) : null,
      newNextButOne ? preloadImage(newNextButOne.image) : null,
    ].filter((image): image is HTMLImageElement => image !== null);

    setHiddenPlayedCardId(card.id);
    setPendingPlacement({
      card,
      displayLives: state.lives,
      fromViewport: {
        x: rect.left,
        y: rect.top,
      },
    });
    setPendingResolvedState({
      ...nextState,
      imageCache: newImageCache,
      next: newNext,
      nextButOne: newNextButOne,
      lives: correct ? state.lives : state.lives - 1,
    });
    setDeckState("hidden");
    setState({
      ...nextState,
      imageCache: [...state.imageCache],
      next: state.next,
      nextButOne: state.nextButOne,
      lives: state.lives,
    });
  }

  function onCardDrop(point: { x: number; y: number }, rect: DOMRect | null) {
    setIsDragging(false);
    const droppedIndex = getProjectedDropIndex(point, rect);
    previewIndexRef.current = null;
    setPreviewIndex(null);

    if (state.next === null || droppedIndex === null || rect === null) {
      return false;
    }

    commitDeckDrop(state.next, droppedIndex, rect);
    return true;
  }

  React.useEffect(() => {
    if (
      !restoredFromSnapshot ||
      !showLivesScene ||
      state.next === null ||
      state.played.length === 0
    ) {
      return;
    }

    previousNextIdRef.current = state.next.id;
    setDeckState("ready");
  }, [restoredFromSnapshot, showLivesScene, state.next, state.played.length]);

  React.useEffect(() => {
    const nextId = state.next?.id ?? null;
    if (nextId !== previousNextIdRef.current) {
      previousNextIdRef.current = nextId;
      setDeckState(nextId === null ? "hidden" : "hidden");
    }
  }, [state.next?.id]);

  React.useEffect(() => {
    if (
      pendingPlacement === null ||
      boardRef.current === null ||
      bottomRef.current === null
    ) {
      return;
    }

    const boardEl = boardRef.current;
    const bottomEl = bottomRef.current;

    if (!boardEl || !bottomEl) {
      return;
    }

    const nextPlacementAnimation = createPlacementAnimationState({
      boardEl,
      bottomEl,
      request: pendingPlacement,
    });

    if (!nextPlacementAnimation) {
      return;
    }

    setPlacementAnimation(nextPlacementAnimation);
    setPendingPlacement(null);
  }, [pendingPlacement, state.played]);

  React.useEffect(() => {
    if (state.badlyPlaced !== null || hiddenPlayedCardId !== null) {
      return;
    }

    const hiddenDateCard = state.played.find((item) => !item.played.showDate);
    if (!hiddenDateCard) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setState({
        ...state,
        played: state.played.map((item) =>
          item.id === hiddenDateCard.id
            ? {
                ...item,
                played: { ...item.played, showDate: true },
              }
            : item,
        ),
      });
    }, 80);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hiddenPlayedCardId, setState, state]);

  React.useEffect(() => {
    if (
      !showLivesScene ||
      openingDealInFlight ||
      openingDeal !== null ||
      state.next === null ||
      state.played.length !== 0
    ) {
      return;
    }

    const boardRect = boardRef.current?.getBoundingClientRect();
    const deckRect = deckAnchorRef.current?.getBoundingClientRect();
    const targetRect = openingAnchorRef.current?.getBoundingClientRect();

    if (!boardRect || !deckRect || !targetRect) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setOpeningDealInFlight(true);
      setOpeningDeal({
        card: state.next!,
        from: {
          x: deckRect.left - boardRect.left,
          y: deckRect.top - boardRect.top,
        },
        to: {
          x: targetRect.left - boardRect.left,
          y: targetRect.top - boardRect.top,
        },
      });
    }, OPENING_DEAL_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    openingDeal,
    openingDealInFlight,
    showLivesScene,
    state.next,
    state.played.length,
    anchorVersion,
  ]);

  React.useEffect(() => {
    if (openingDeal === null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      commitPlacedCard(openingDeal.card);
      setOpeningDeal(null);
      setOpeningDealInFlight(false);
    }, OPENING_DEAL_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [commitPlacedCard, openingDeal]);

  React.useEffect(() => {
    if (showLives) {
      setFrozenDeckState(null);
      setGameOverPhase("playing");
      return;
    }

    if (gameOverPhase === "playing") {
      setFrozenDeckState({
        deckState,
        next: state.next,
        reserve: state.nextButOne,
      });
      setGameOverPhase("linger");
      return;
    }

    if (gameOverPhase === "linger") {
      const timeoutId = window.setTimeout(() => {
        setGameOverPhase("hud-exit");
      }, GAME_OVER_LINGER_DURATION_MS);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    if (gameOverPhase === "hud-exit") {
      const timeoutId = window.setTimeout(() => {
        setGameOverPhase("summary");
      }, GAME_OVER_FADE_DURATION_MS);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [deckState, gameOverPhase, showLives, state.next, state.nextButOne]);

  React.useEffect(() => {
    if (
      !showLivesScene ||
      deckState !== "hidden" ||
      openingDealInFlight ||
      openingDeal !== null ||
      hiddenPlayedCardId !== null ||
      state.next === null ||
      state.badlyPlaced !== null ||
      state.played.length === 0 ||
      state.played.some((item) => !item.played.showDate)
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDeckState("revealing");
    }, DEAL_REVEAL_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    deckState,
    openingDeal,
    openingDealInFlight,
    hiddenPlayedCardId,
    showLivesScene,
    state.badlyPlaced,
    state.next,
    state.played,
  ]);

  React.useEffect(() => {
    if (deckState !== "revealing") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDeckState("ready");
    }, DEAL_REVEAL_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [deckState]);

  const score = React.useMemo(() => {
    return state.played.filter((item) => item.played.correct).length - 1;
  }, [state.played]);

  React.useLayoutEffect(() => {
    if (score > highscore) {
      updateHighscore(score);
    }
  }, [score, highscore, updateHighscore]);

  return (
    <div ref={boardRef} className={styles.wrapper}>
      <div
        className={classNames(styles.top, {
          [styles.topGameOver]: showGameOverSummary,
        })}
      >
        <div className={styles.statusArea}>
          <AnimatePresence mode="wait">
            {statusScene === "lives" ? (
              <motion.div
                key="lives"
                animate={{ opacity: gameOverPhase === "hud-exit" ? 0 : 1 }}
                className={styles.statusLayer}
                exit={{ opacity: 0 }}
                initial={false}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <Lives lives={state.lives} />
              </motion.div>
            ) : (
              <motion.div
                key="game-over"
                animate={{ opacity: 1 }}
                className={styles.statusLayer}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <GameOver
                  dailyDateKey={dailyDateKey}
                  difficulty={difficulty}
                  gameMode={gameMode}
                  highscore={highscore}
                  played={state.played}
                  resetGame={resetGame}
                  routePath={routePath}
                  score={score}
                  selectionRoute={selectionRoute}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {deckVisible && renderedDeckState ? (
          <NextItemList
            deckAnchorRef={deckAnchorRef}
            deckState={renderedDeckState.deckState}
            next={openingDealInFlight ? null : renderedDeckState.next}
            onDeckAnchorChange={handleDeckAnchorChange}
            onCardDragMove={(point, rect) => {
              if (rect) {
                const nextDragCentreX = rect.left + rect.width / 2;
                const lastDragCentreX = lastDragCentreXRef.current;

                if (lastDragCentreX !== null) {
                  const deltaX = nextDragCentreX - lastDragCentreX;

                  if (deltaX > 0.5) {
                    dragDirectionRef.current = 1;
                  } else if (deltaX < -0.5) {
                    dragDirectionRef.current = -1;
                  }
                }

                lastDragCentreXRef.current = nextDragCentreX;
              }

              maybeAutoScrollDuringDrag(point, rect);
              updatePreviewIndex(getProjectedDropIndex(point, rect));
            }}
            onCardDragStart={onCardDragStart}
            onCardDrop={onCardDrop}
            reserve={renderedDeckState.reserve}
            visible={deckShown}
          />
        ) : null}
      </div>
      <motion.div
        id="bottom"
        ref={bottomRef}
        layoutScroll={timelineLayoutAnimationsEnabled}
        className={styles.bottom}
      >
        <PlayedItemList
          hiddenCardId={hiddenPlayedCardId}
          isDragging={isDragging}
          items={state.played}
          layoutAnimationsEnabled={timelineLayoutAnimationsEnabled}
          onOpeningAnchorChange={handleOpeningAnchorChange}
          openingAnchorRef={openingAnchorRef}
          previewIndex={previewIndex}
        />
      </motion.div>
      {openingDeal?.card ? (
        <DealAnimationLayer
          card={openingDeal.card}
          from={openingDeal.from}
          to={openingDeal.to}
        />
      ) : null}
      {placementAnimation ? (
        <PlacementAnimationLayer
          boardRef={boardRef}
          flight={placementAnimation}
          onComplete={() => {
            if (pendingResolvedState) {
              if (pendingResolvedState.lives <= 0) {
                setFrozenDeckState({
                  deckState,
                  next: pendingResolvedState.next,
                  reserve: pendingResolvedState.nextButOne,
                });
                setGameOverPhase("linger");
              }
              setState(pendingResolvedState);
              setPendingResolvedState(null);
            }
            setHiddenPlayedCardId(null);
            setPlacementAnimation(null);
          }}
          scrollContainerRef={bottomRef}
        />
      ) : null}
    </div>
  );
}
