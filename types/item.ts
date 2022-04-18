export interface Item {
  description: string;
  id: string;
  image: string;
  instance_of: string[];
  label: string;
  num_sitelinks: number;
  page_views: number;
  wikipedia_title: string;
  population: number;
}

export type PlayedItem = Item & {
  played: {
    correct: boolean;
  };
};
