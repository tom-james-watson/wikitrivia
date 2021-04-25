import React, { useState } from "react";
import axios from "axios";
import { GameState } from "../types/game";
import { Item } from "../types/item";
import createState from "../lib/create-state";
import Board from "./board";
import Loading from "./loading";

export default function Game() {
  const [state, setState] = useState<GameState>({
    badlyPlaced: null,
    deck: [],
    imageCache: [],
    next: null,
    nextButOne: null,
    played: [],
  });
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    const fetchGameData = async () => {
      const res = await axios.get<string>("/items.json");
      const items = res.data.trim().split("\n");
      const deck: Item[] = items.map((line) => {
        return JSON.parse(line);
      });
      setState(await createState(deck));
      setLoaded(true);
    };

    fetchGameData();
  }, []);

  return (
    <>{loaded ? <Board state={state} setState={setState} /> : <Loading />}</>
  );
}
