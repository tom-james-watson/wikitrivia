
import { Item } from "../types/item";
import ademeCategories from "../data/ademe/0-categories.json";
import enNumerique from "../data/ademe/en/1-numerique.json";
import enAlimentation from "../data/ademe/en/2-alimentation.json";
import enBoisson from "../data/ademe/en/3-boisson.json";
import enTransport from "../data/ademe/en/4-transport.json";
import enHabillement from "../data/ademe/en/5-habillement.json";
import enElectromenager from "../data/ademe/en/6-electromenager.json";
import enMobilier from "../data/ademe/en/7-mobilier.json";
import enChauffage from "../data/ademe/en/8-chauffage.json";
import enVegetablesAndFruits from "../data/ademe/en/9-fruitsetlegumes.json";
import frNumerique from "../data/ademe/fr/1-numerique.json";
import frAlimentation from "../data/ademe/fr/2-alimentation.json";
import frBoisson from "../data/ademe/fr/3-boisson.json";
import frTransport from "../data/ademe/fr/4-transport.json";
import frHabillement from "../data/ademe/fr/5-habillement.json";
import frElectromenager from "../data/ademe/fr/6-electromenager.json";
import frMobilier from "../data/ademe/fr/7-mobilier.json";
import frChauffage from "../data/ademe/fr/8-chauffage.json";
import frVegetablesAndFruits from "../data/ademe/fr/9-fruitsetlegumes.json";
import footprintDetailCategories from "../data/ademe/footprintDetailCategories.json";
import { AdemeCategory, AdemeECV, FootprintDetails } from "../types/AdemeECV";
import { Locale } from "../types/i18n";

export function getDefaultItems(locale: Locale): Item[] {
  const slugs = [
    "smartphone",
    "television",
    "ordinateurportable",
    "repasavecduboeuf",
    "repasvegetarien",
    "repasavecdupoulet",
    "eauenbouteille",
    "vin",
    "laitdevache",
    "jeans",
    "tshirtencoton",
    "pullenlaine",
    "fourelectrique",
    "lavelinge",
    "refrigirateur",
    "chaiseenbois",
    "lit",
    "chauffagegaz",
    "chauffagefioul",
    "chauffageelectrique",
    "pompeachaleur",
    "avion-moyencourrier",
    "tgv",
    "voiturethermique",
    "voitureelectrique"
  ];

  const selectedItems: Item[] = [];
  getAllItems(locale).forEach(item => {
    if (slugs.includes(item.source.slug)) {
      selectedItems.push(item);
    }
  });
  return selectedItems;
}

export function getItemFromSlug(slug: string, locale: Locale): Item | undefined {
  const allItems = getAllItems(locale);
  for (let i = 0; i < allItems.length; i++) {
    if (allItems[i].source.slug === slug) {
      return allItems[i];
    }
  }
  return undefined;
}

const allItems: Item[] = [];
function getAllItems(locale: Locale): Item[] {
  if (allItems.length === 0) {
    for (let i = 1; i <= loadCategories().length; i++) {
      allItems.push(...loadCategory(i, locale));
    }
  }
  return allItems;
}

let categories: AdemeCategory[] = [];
export function loadCategories(): AdemeCategory[] {
  if (categories.length === 0) {
    categories = ademeCategories.data;
  }
  return categories;
}

export function loadCategory(id: number, locale: Locale): Item[] {
  // Hardcoded at the moment, to be seen with ADEME if we don't need to extend their data at some point
  switch (id) {
    case 1:
      return loadDigital(locale);
    case 2:
      return loadFood(locale);
    case 3:
      return loadDrinks(locale);
    case 4:
      return loadTransports(locale);
    case 5:
      return loadClothes(locale);
    case 6:
      return loadHouseholdAppliances(locale);
    case 7:
      return loadFurnitures(locale);
    case 8:
      return loadHeating(locale);
    case 9:
      return loadVegetablesAndFruits(locale);
    case 10:
      return []; // TODO Usage numérique needs more work
    default:
      return [];
  }
}

const digitalItems: Item[] = [];
function loadDigital(locale: Locale): Item[] {
  if (digitalItems.length === 0) {
    const numerique = locale === "fr" ? frNumerique : enNumerique;
    numerique.data.forEach(element => {
      const item: Item = {
        id: element.slug,
        categoryId: 1,
        label: element.name,
        description: !element.usage ? "" :
          locale === "fr" ?
            "Achat et usage pendant " + element.usage.defaultyears + " ans" :
            "Purchase and usage for " + element.usage.defaultyears + " years.",
        explanation: "",
        source: element
      }
      digitalItems.push(item);
    });
  }
  return digitalItems;
}

const foodItems: Item[] = [];
function loadFood(locale: Locale): Item[] {
  if (foodItems.length === 0) {
    const alimentation = locale === "fr" ? frAlimentation : enAlimentation;
    alimentation.data.forEach(element => {
      const item: Item = {
        id: element.slug,
        categoryId: 2,
        label: element.name + (element.slug.startsWith("repas") ? "" : " (1kg)"),
        description: "",
        explanation: "",
        source: element
      }
      foodItems.push(item);
    });
  }
  return foodItems;
}

const drinkItems: Item[] = [];
function loadDrinks(locale: Locale): Item[] {
  if (drinkItems.length === 0) {
    const boisson = locale === "fr" ? frBoisson : enBoisson;
    boisson.data.forEach(element => {
      const item: Item = {
        id: element.slug,
        categoryId: 3,
        label: element.name + " (1L)",
        description: "",
        explanation: "",
        source: element
      }
      drinkItems.push(item);
    });
  }
  return drinkItems;
}

const transportItems: Item[] = [];
function loadTransports(locale: Locale): Item[] {
  if (transportItems.length === 0) {
    const transport = locale === "fr" ? frTransport : enTransport;
    transport.data.forEach(element => {
      const coeff = transportCoeff[element.slug];
      applyCoefficient(element, coeff);
      const item: Item = {
        id: element.slug,
        categoryId: 4,
        label: element.name + ` (${coeff}km)`,
        description: "",
        explanation: "",
        source: element
      }
      transportItems.push(item);
    });
  }
  return transportItems;
}

const clotheItems: Item[] = [];
function loadClothes(locale: Locale): Item[] {
  if (clotheItems.length === 0) {
    const habillement = locale === "fr" ? frHabillement : enHabillement;
    habillement.data.forEach(element => {
      const item: Item = {
        id: element.slug,
        categoryId: 5,
        label: element.name,
        description: "",
        explanation: "",
        source: element
      }
      clotheItems.push(item);
    });
  }
  return clotheItems;
}

const householdApplianceItems: Item[] = [];
function loadHouseholdAppliances(locale: Locale): Item[] {
  if (householdApplianceItems.length === 0) {
    const electromenager = locale === "fr" ? frElectromenager : enElectromenager;
    electromenager.data.forEach(element => {
      const item: Item = {
        id: element.slug,
        categoryId: 6,
        label: element.name,
        description: !element.usage ? "" :
          locale === "fr" ?
            "Achat et usage pendant " + element.usage.defaultyears + " ans" :
            "Purchase and usage for " + element.usage.defaultyears + " years.",
        explanation: "",
        source: element
      }
      householdApplianceItems.push(item);
    });
  }
  return householdApplianceItems;
}

const furnitureItems: Item[] = [];
function loadFurnitures(locale: Locale): Item[] {
  if (furnitureItems.length === 0) {
    const mobilier = locale === "fr" ? frMobilier : enMobilier;
    mobilier.data.forEach(element => {
      const item: Item = {
        id: element.slug,
        categoryId: 7,
        label: element.name,
        description: "",
        explanation: "",
        source: element
      }
      furnitureItems.push(item);
    });
  }
  return furnitureItems;
}

const heatingItems: Item[] = [];
function loadHeating(locale: Locale): Item[] {
  if (heatingItems.length === 0) {
    const chauffage = locale === "fr" ? frChauffage : enChauffage;
    chauffage.data.forEach(element => {
      applyCoefficient(element, 60/12); // From 1m2 to 60m2, from 12 months to 1 month
      const item: Item = {
        id: element.slug,
        categoryId: 8,
        label: element.name.replace(" par m²", "").replace(" per m²", ""),
        description: locale === "fr" ?
          "<strong>par mois</strong> pour 60m²" :
          "<strong>per month</strong> for 60m²",
        explanation: locale === "fr" ?
          "Impact pour un mois de chauffage d'un logement de 60m² en lissant la consommation sur l'année." :
          "Impact of one month of heating a house of 60m², spreading the consumption over the year.",
        source: element
      }
      heatingItems.push(item);
    });
  }
  return heatingItems;
}

const vegetablesAndFruitsItems: Item[] = [];
function loadVegetablesAndFruits(locale: Locale): Item[] {
  if (vegetablesAndFruitsItems.length === 0) {
    const vegetablesAndFruits = locale === "fr" ? frVegetablesAndFruits : enVegetablesAndFruits;
    vegetablesAndFruits.data.forEach(element => {
      const item: Item = {
        id: element.slug,
        categoryId: 9,
        label: element.name + " (1kg)",
        description: locale === "fr" ?
          "Consommé le mois de mars" :
          "Bought in March",
        explanation: "",
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
//     source: element
//   }
//   items.push(item);
// });

export function getFootprintDetails(): FootprintDetails {
  return footprintDetailCategories;
}

const transportCoeff: {[key: string]: number} = {
  "avion-courtcourrier": 800,
  "avion-moyencourrier": 2000,
  "avion-longcourrier": 6000,
  "tgv": 700,
  "intercites": 400,
  "voiturethermique": 100,
  "voitureelectrique": 100,
  "autocar": 400,
  "velo": 5,
  "veloelectrique": 5,
  "busthermique": 5,
  "tramway": 5,
  "metro": 5,
  "scooter": 5,
  "moto": 100,
  "rer": 20,
  "ter": 100,
  "buselectrique": 5,
  "trottinette": 5,
  "busgnv": 5,
  "marche": 5
}

function applyCoefficient(element: AdemeECV, coeff: number) {
  element.ecv = element.ecv * coeff;
  if (element.footprint) {
    element.footprint = element.footprint * coeff;
  }
  if (element.footprintDetail) {
    element.footprintDetail.forEach(detail => detail.value = detail.value * coeff);
  }
}