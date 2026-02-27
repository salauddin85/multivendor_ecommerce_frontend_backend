export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  inStock: boolean;
  brand: string;
  available_stock: number;
  product_code: string;
  rating: number;
  colors: string[];
}
