export type ProductVariant = {
  id: number;
  product: string;
  sku: string;
  variant_name: string;
  price: string;
  discount_price: string;
  stock: number;
  image: string;
  created_at: string;
  updated_at: string;
  is_default: boolean;
};

export type VariantPagination = {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | boolean | null;
  previous: string | boolean | null;
  page_size?: number;
};

export type ProductVariantResponse = {
  code: number;
  status: string;
  message: string;
  data: ProductVariant[];
  pagination: VariantPagination;
};
