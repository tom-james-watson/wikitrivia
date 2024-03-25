
import { Item } from "../types/item";
import numerique from "../data/ademe/1-numerique.json";
import repas from "../data/ademe/2-repas.json";
import boisson from "../data/ademe/3-boisson.json";
import habillement from "../data/ademe/5-habillement.json";
import electromenager from "../data/ademe/6-electromenager.json";
//import usageNumerique from "../data/ademe/10-usagenumerique.json";

export function loadDigital(): Item[] {
  const items: Item[] = [];
  numerique.data.forEach(element => {
    const item: Item = {
      id: element.slug,
      category: "digital",
      label: element.name,
      description: "Achat et usage pendant " + element.usage.defaultyears + " ans.",
      explanation: "",
      image: "",
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

export function loadMeal(): Item[] {
  const items: Item[] = [];
  repas.data.forEach(element => {
    const item: Item = {
      id: element.slug,
      category: "food",
      label: element.name,
      description: "",
      explanation: "",
      image: "",
      source: element
    }
    items.push(item);
  });

  boisson.data.forEach(element => {
    const item: Item = {
      id: element.slug,
      category: "food",
      label: element.name + " (1L)",
      description: "",
      explanation: "",
      image: "",
      source: element
    }
    items.push(item);
  });

  return items;
}

export function loadClothes(): Item[] {
  const items: Item[] = [];
  habillement.data.forEach(element => {
    const item: Item = {
      id: element.slug,
      category: "clothes",
      label: element.name,
      description: "",
      explanation: "",
      image: "",
      source: element
    }
    items.push(item);
  });

  return items;
}

export function loadHouseholdAppliances(): Item[] {
  const items: Item[] = [];
  electromenager.data.forEach(element => {
    const item: Item = {
      id: element.slug,
      category: "housholdAppliances",
      label: element.name,
      description: element.usage ? "Achat et usage pendant " + element.usage.defaultyears + " ans." : "",
      explanation: "",
      image: "",
      source: element
    }
    items.push(item);
  });

  return items;
}