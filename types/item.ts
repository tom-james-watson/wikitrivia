export interface Item {
  id: string;
  label: string;
  description: string;
  category: string;
  image: string;
  co2: number;
}

export type PlayedItem = Item & {
  played: {
    correct: boolean;
  };
};
