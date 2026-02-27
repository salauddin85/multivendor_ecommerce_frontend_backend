// types/catalog.ts

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  display_order: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  display_order: number;
  children: Category[];
}

export interface Store {
  id: number;
  store_name: string;
  slug: string;
  type: string;
  logo: string | null;
  banner: string | null;
  status: string;
  vendor: number | null;
}


export interface ApiResponse<T> {
  code: number;
  status: string;
  message: string;
  data: T;
  pagination?: {
    count: number;
    total_pages: number;
    current_page: number;
    next: string | null;
    previous: string | null;
    page_size: number;
  };
}
