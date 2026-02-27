// types/blog.ts

export interface Blog {
  id: number;
  title: string;
  author_name: string;
  featured_image: string | null;
  summary: string;
  created_at: string; // ISO string
}

export interface BlogDetail extends Blog {
  category: string;
  tags: string[];
  updated_at: string;
  content: string;
}

export interface Pagination {
  count: number;
  total_pages: number;
  current_page: number;
  next: number | null;
  previous: number | null;
  page_size: number;
}

export interface BlogsApiResponse {
  code: number;
  message: string;
  status: "success" | "error";
  data: Blog[];
  pagination: Pagination;
}

export interface BlogDetailApiResponse {
  code: number;
  message: string;
  status: "success" | "error";
  data: BlogDetail;
}
