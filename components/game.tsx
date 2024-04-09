import React, { useState } from "react";
import Board from "./board";
import Instructions from "./instructions";
import { Item } from "../types/item";
import { loadCategory } from "../lib/ademe-api";

export default function Game() {
  const [started, setStarted] = useState(false);
   // 0 is a fake one, to avoid the hassle of subtracting by one all the time. 1, 2, 3, 5 & 6 are selected by default
  const [selectedCategories, setSelectedCategories] = useState<boolean[]>([false, false, false, false, false, false, false, false, false, false, false]);

  const items: Item[] = [];
  for (let i = 1; i < selectedCategories.length; i++) {
    if (selectedCategories[i]) {
      items.push(...loadCategory(i));
    }
  }

  const [highscore, setHighscore] = React.useState<number>(
    Number(localStorage.getItem("highscore") ?? "0")
  );

  const updateHighscore = React.useCallback((score: number) => {
    localStorage.setItem("highscore", String(score));
    setHighscore(score);
  }, []);

  return (started ?
    <Board highscore={highscore} items={items} updateHighscore={updateHighscore} restart={() => setStarted(false)} />
    :
    <Instructions highscore={highscore} start={() => setStarted(true)} selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} />
  );
}
