import React, { useState } from "react";
import Board from "./board";
import Instructions from "./instructions";
import { Item } from "../types/item";
import createState from "../lib/create-state";

export default function Game() {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [categoriesMode, setCategoriesMode] = useState(false);

  const [highscore, setHighscore] = React.useState<number>(
    Number(localStorage.getItem("highscore") ?? "0")
  );

  const updateHighscore = React.useCallback((score: number) => {
    localStorage.setItem("highscore", String(score));
    setHighscore(score);
  }, []);

  const restart = (categoriesMode: boolean) => {
    setSelectedItems([]);
    setCategoriesMode(categoriesMode);
  };

  return (selectedItems.length > 0 ?
    <Board highscore={highscore} initialState={createState(selectedItems)} updateHighscore={updateHighscore} restart={restart} />
    :
    <Instructions highscore={highscore} setSelectedItems={setSelectedItems} categoriesMode={categoriesMode} setCategoriesMode={setCategoriesMode} />
  );
}
