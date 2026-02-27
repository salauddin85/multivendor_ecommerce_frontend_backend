export type ProductAttribute = {
  id: number;
  product: {
    id: number;
    title: string;
    slug: string;
  };
  name: string;
  is_variation: boolean;
  created_at: string;
  updated_at: string;
};

export type AttributePagination = {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | boolean | null;
  previous: string | boolean | null;
  page_size?: number;
};

export type ProductAttributeResponse = {
  code: number;
  status: string;
  message: string;
  data: ProductAttribute[];
  pagination: AttributePagination;
};