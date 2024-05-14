
import { Item } from "../types/item";
import ademeCategories from "../data/ademe/0-categories.json";
import numerique from "../data/ademe/1-numerique.json";
import repas from "../data/ademe/2-repas.json";
import boisson from "../data/ademe/3-boisson.json";
import habillement from "../data/ademe/5-habillement.json";
import electromenager from "../data/ademe/6-electromenager.json";
import mobilier from "../data/ademe/7-mobilier.json";
import vegetablesAndFruits from "../data/ademe/9-fruitsetlegumes.json";
import { AdemeCategory } from "../types/AdemeECV";
//import usageNumerique from "../data/ademe/10-usagenumerique.json";

let categories: AdemeCategory[] = [];
export function loadCategories(): AdemeCategory[] {
  if (categories.length === 0) {
    categories = ademeCategories.data;
  }
  return categories;
}

export function loadCategory(id: number): Item[] {
  // Hardcoded at the moment, to be seen with ADEME if we don't need to extend their data at some point
  switch (id) {
    case 1:
      return loadDigital();
    case 2:
      return loadMeal();
    case 3:
      return loadDrinks();
    case 4:
      return []; // TODO Transport needs more work
    case 5:
      return loadClothes();
    case 6:
      return loadHouseholdAppliances();
    case 7:
      return loadFurnitures();
    case 8:
      return []; // TODO Chauffage needs more work
    case 9:
      return loadVegetablesAndFruits();
    case 10:
      return []; // TODO Usage numérique needs more work
    default:
      return [];
  }
}

const digitalItems: Item[] = [];
function loadDigital(): Item[] {
  if (digitalItems.length === 0) {
    numerique.data.forEach(element => {
      const item: Item = {
        id: element.slug,
        categoryId: 1,
        label: element.name,
        description: "Achat et usage pendant " + element.usage.defaultyears + " ans.",
        explanation: "",
        image: "📱 💻 🖥️",
        source: element
      }
      digitalItems.push(item);
    });
  }
  return digitalItems;
}

const mealItems: Item[] = [];
function loadMeal(): Item[] {
  if (mealItems.length === 0) {
    repas.data.forEach(element => {
      const item: Item = {
        id: element.slug,
        categoryId: 2,
        label: element.name,
        description: "",
        explanation: "",
        image: "🐟 🍽 🥩",
        source: element
      }
      mealItems.push(item);
    });
  }
  return mealItems;
}

const drinkItems: Item[] = [];
function loadDrinks(): Item[] {
  if (drinkItems.length === 0) {
    boisson.data.forEach(element => {
      const item: Item = {
        id: element.slug,
        categoryId: 3,
        label: element.name + " (1L)",
        description: "",
        explanation: "",
        image: "🍺 🍹 🥛",
        source: element
      }
      drinkItems.push(item);
    });
  }
  return drinkItems;
}

const clotheItems: Item[] = [];
function loadClothes(): Item[] {
  if (clotheItems.length === 0) {
    habillement.data.forEach(element => {
      const item: Item = {
        id: element.slug,
        categoryId: 5,
        label: element.name,
        description: "",
        explanation: "",
        image: "👞 👔 👗",
        source: element
      }
      clotheItems.push(item);
    });
  }
  return clotheItems;
}

const householdApplianceItems: Item[] = [];
function loadHouseholdAppliances(): Item[] {
  if (householdApplianceItems.length === 0) {
    electromenager.data.forEach(element => {
      const item: Item = {
        id: element.slug,
        categoryId: 6,
        label: element.name,
        description: element.usage ? "Achat et usage pendant " + element.usage.defaultyears + " ans." : "",
        explanation: "",
        image: "🧊 🛁 ☕",
        source: element
      }
      householdApplianceItems.push(item);
    });
  }
  return householdApplianceItems;
}

const furnitureItems: Item[] = [];
function loadFurnitures(): Item[] {
  if (furnitureItems.length === 0) {
    mobilier.data.forEach(element => {
      const item: Item = {
        id: element.slug,
        categoryId: 7,
        label: element.name,
        description: "",
        explanation: "",
        image: "🛏️ 🪑 🛋️",
        source: element
      }
      furnitureItems.push(item);
    });
  }
  return furnitureItems;
}

const vegetablesAndFruitsItems: Item[] = [];
function loadVegetablesAndFruits(): Item[] {
  if (vegetablesAndFruitsItems.length === 0) {
    vegetablesAndFruits.data.forEach(element => {
      const item: Item = {
        id: element.slug,
        categoryId: 9,
        label: element.name + " (1kg)",
        description: "Consommé le mois de mars",
        explanation: "",
        image: "🥑 🍇 🍅",
        source: element
      }
      vegetablesAndFruitsItems.push(item);
    });
  }
  return vegetablesAndFruitsItems;
}



// Not ready on Ademe side, they should explain with which device, on which network, how much, etc.
// usageNumerique.data.forEach(element => {
//   const item: Item = {
//     id: element.slug,
//     category: "digital",
//     label: element.name,
//     description: "Achat et usage pendant " + element.usage.defaultyears + " ans.",
//     explanation: "",
//     image: "",
//     source: element
//   }
//   items.push(item);
// });