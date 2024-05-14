import React, { useState } from "react";
import { loadCategories } from "../lib/ademe-api";
import classNames from "classnames";
import styles from "../styles/categories-selector.module.scss";
import { Trans, t } from "@lingui/macro";
import { Item } from "../types/item";
import Button from "./button";
import { loadCategory } from "../lib/ademe-api";

interface CategoriesSelectorProps {
  setSelectedItems: (selectedItems: Item[]) => void;
  setCategoriesMode: (categoriesMode: boolean) => void;
}

export default function CategoriesSelector({setSelectedItems, setCategoriesMode}: CategoriesSelectorProps) {

  const categories = loadCategories();
  // Make 0 a fake one, to avoid the hassle of subtracting by one all the time.
  const [selectedCategories, setSelectedCategories] = useState<boolean[]>(Array(categories.length + 1).fill(false));
  const updateCategories = (id: number) => {
    // Some categories are not available yet
    if (id === 4 || id === 8 || id === 10) {
      alert(t`This category is not yet available.`);
    } else {
      selectedCategories[id] = !selectedCategories[id];
      setSelectedCategories([...selectedCategories]); // We create a new array to force a React rerender 
    }
  };

  return (
    <div>
      <div>
        <h3><Trans>Select the categories you want to play with:</Trans></h3>
        <div className={classNames(styles.categoriesSelection)}>
          {categories.map((category) => {
            const id = category.id;
            return (
              <div key={id} className={selectedCategories[id] ? classNames(styles.selected) : ""} onClick={() => updateCategories(id)}>
                <div>
                  <h3>{category.name}</h3>
                  <p>{category.emoji}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="button-container">
        <Button onClick={() => { setSelectedItems(getItemsFromCategories(selectedCategories)); }} disabled={!selectedCategories.includes(true)}><Trans>Start game</Trans></Button>
        <Button onClick={() => setCategoriesMode(false)} minimal={true}><Trans>Back</Trans></Button>
      </div>
    </div>
  );
}

function getItemsFromCategories(selectedCategories: boolean[]) {
  const items: Item[] = [];
  for (let i = 1; i < selectedCategories.length; i++) {
    if (selectedCategories[i]) {
      items.push(...loadCategory(i));
    }
  }
  return items;
}