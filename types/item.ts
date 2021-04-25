export interface Item {
  date_prop_id: string;
  description: string;
  id: string;
  image: string;
  instance_of: string[];
  label: string;
  num_sitelinks: number;
  occupations: string[] | null;
  page_views: number;
  wikipedia_title: string;
  year: number;
}

export type PlayedItem = Item & {
  played: {
    correct: boolean;
  };
};
