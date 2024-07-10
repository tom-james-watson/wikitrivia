import React, { useState } from "react";
import axios from "axios";
import { GameState } from "../types/game";
import { Item } from "../types/item";
import createState from "../lib/create-state";
import Board from "./board";
import Loading from "./loading";
import Instructions from "./instructions";
import badCards from "../lib/bad-cards";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";

export default function Game() {
  const [state, setState] = useState<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null); 
  
  const router = useRouter();

  React.useEffect(() => {
    const fetchGameData = async () => {
      const res = await axios.get<string>(
        "https://wikitrivia-data.tomjwatson.com/items.json"
      );
      const items: Item[] = res.data
        .trim()
        .split("\n")
        .map((line) => {
          return JSON.parse(line);
        })
        // Filter out questions which give away their answers
        .filter((item) => !item.label.includes(String(item.year)))
        .filter((item) => !item.description.includes(String(item.year)))
        .filter((item) => !/(?:th|st|nd)[ -]century/i.test(item.description))
        // Filter cards which have bad data as submitted in https://github.com/tom-james-watson/wikitrivia/discussions/2
        .filter((item) => !(item.id in badCards));
      setItems(items);
    };

    fetchGameData();
  }, []);

  
  const searchParams = useSearchParams();
  React.useEffect(() => {
    (async () => {
      if (items !== null) {
        const URLSeed = searchParams.get("seed");
        if (Number.isNaN(Number(URLSeed))) {
          const { pathname } = router;
          router.replace(
              { pathname, query: "" },
              undefined, 
              { shallow: true }
          );
        } else {
          setStarted(true);
        }
        setState(await createState(items, URLSeed ?? undefined));
        setLoaded(true);
      }
    })();
  }, [items]);

  const setURLSeed = (seed?: string) => {    
    const query = seed ?? ""
    const { pathname } = router;
    console.log(router);
    router.replace(
        { pathname, query },
        undefined, 
        { shallow: true }
    );
  };
  
  const resetGame = React.useCallback(() => {
    (async () => {
      if (items !== null) {
        setState(await createState(items));
        setURLSeed();
      }
    })();
  }, [items]);

  const joinGame = React.useCallback((seed: string) => {
    (async () => {
      if (items !== null) {
        setState(await createState(items, seed, false));
      }
    })();
  }, [items]);

  const dailyGame = React.useCallback(() => {
    (async () => {
      setURLSeed();
      if (items !== null) {
        const date = new Date();
        const seed = `${date.getDay()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        setState(await createState(items, seed, true));
      }
    })();
  }, [items]);

  const [highscore, setHighscore] = React.useState<number>(
    Number(localStorage.getItem("highscore") ?? "0")
  );

  const updateHighscore = React.useCallback((score: number) => {
    localStorage.setItem("highscore", String(score));
    setHighscore(score);
  }, []);

  if (!loaded || state === null) {
    return <Loading />;
  }

  if (!started) {
    return (
      <Instructions 
        highscore={highscore} 
        startDaily={() => {
          dailyGame();
          setStarted(true);
        }}
        startRandom={() => {
          resetGame();
          setStarted(true);
        }}
        startSpecific={(seed: string) => {
          joinGame(seed);
          setStarted(true);
        }}
        />
    );
  }

  return (
    <Board
      highscore={highscore}
      state={state}
      setState={setState}
      resetGame={resetGame}
      dailyGame={dailyGame}
      updateHighscore={updateHighscore}
    />
  );
}
