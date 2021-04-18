export interface Item {
  id: string;
  label: string;
  description: string;
  image?: string;
  date: string;
  date_prop_id: string;
  wikipedia: string;
  num_sitelinks: number;
  page_views: number;
  types: string[];
}
