
import { Item } from "../types/item";
import categories from "../data/ademe/0-categories.json";
import numerique from "../data/ademe/1-numerique.json";
import repas from "../data/ademe/2-repas.json";
import boisson from "../data/ademe/3-boisson.json";
import habillement from "../data/ademe/5-habillement.json";
import electromenager from "../data/ademe/6-electromenager.json";
import mobilier from "../data/ademe/7-mobilier.json";
import vegetablesAndFruits from "../data/ademe/9-fruitsetlegumes.json";
import { AdemeCategory } from "../types/AdemeECV";
//import usageNumerique from "../data/ademe/10-usagenumerique.json";

export function loadCategories(): AdemeCategory[]  {
  return categories.data;
}

export function loadCategory(id: number): Item[] {
  // Hardcoded at the moment, to be seen with ADEME if we don't need to extend their data at some point
  switch(id) {
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

function loadDigital(): Item[] {
  const items: Item[] = [];
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
    items.push(item);
  });

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
  return items;
}

function loadMeal(): Item[] {
  const items: Item[] = [];
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
    items.push(item);
  });
  return items;
}

function loadDrinks(): Item[] {
  const items: Item[] = [];
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
    items.push(item);
  });
  return items;
}

function loadClothes(): Item[] {
  const items: Item[] = [];
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
    items.push(item);
  });

  return items;
}

function loadHouseholdAppliances(): Item[] {
  const items: Item[] = [];
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
    items.push(item);
  });

  return items;
}

function loadFurnitures(): Item[] {
  const items: Item[] = [];
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
    items.push(item);
  });

  return items;
}

function loadVegetablesAndFruits(): Item[] {
  const items: Item[] = [];
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
    items.push(item);
  });

  return items;
}
