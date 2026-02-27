export type Product = {
  id: number;
  slug: string;
  store: string;
  category: string;
  brand: string;
  title: string;
  type: string;
  description: string;
  base_price: string;
  main_image: string;
  stock: number;
  is_featured: boolean;
  status: string;
  variants: any; // Using any for now to handle both object and array as per JSON sample
};
export type PaginationData = {
  count: number;
  current_page: number;
  total_pages: number;
  next: string | boolean | null;
  previous: string | boolean | null;
  page_size?: number;
};

export type ProductsResponse = {
  code: number;
  status: string;
  message: string;
  data: Product[];
  pagination: PaginationData;
};
