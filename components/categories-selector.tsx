import React from "react";
import { loadCategories } from "../lib/ademe-api";
import classNames from "classnames";
import styles from "../styles/categories-selector.module.scss";

interface CategoriesSelectorProps {
  selectedCategories: boolean[];
  setSelectedCategories: (selectedCategories: boolean[]) => void;
}

export default function CategoriesSelector({selectedCategories, setSelectedCategories}: CategoriesSelectorProps) {
  const categories = loadCategories();
  const updateCategories = (id: number) => {
    // Some categories are not available yet
    if (id === 4 || id === 8 || id === 10) {
      alert("This category is not available yet.");
    } else {
      selectedCategories[id] = !selectedCategories[id];
      setSelectedCategories([...selectedCategories]); // We create a new array to force a React rerender 
    }
  };

  return (
    <div>
      <h3>Select the categories you want to play with:</h3>
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
  );
}