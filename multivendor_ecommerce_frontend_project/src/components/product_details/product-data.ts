export interface Variant {
  id: number
  sku: string
  variant_name: string
  price: string
  discount_price: string
  stock: number
  image: string
}

export interface Attribute {
  id: number
  name: string
  is_variation: boolean
}

export interface ProductImage {
  id: number
  image: string
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Store {
  id: number
  store_name: string
  slug: string
}

export interface Product {
  id: number
  title: string
  slug: string
  description: string
  base_price: string
  main_image: string
  stock: number
  type: string
  status: string
  is_featured: boolean
  view_count: number
  avg_rating: string
  total_reviews: number
  brand: string | null
  category: Category
  store: Store
  images: ProductImage[]
  attributes: Attribute[]
  variants: Variant[]
  offers?: string[]
  specialOffer?: { title: string; description: string }
  reviews?: any[]
  onSale?: boolean
  specification: string
  // specifications?: Array<{ category: string; value: string }>
  keyFeatures?: string[]
}

// export const dummyProduct: Product = {
//   id: 1,
//   title: "Macbook Air 13",
//   slug: "macbook-air-13",
//   description: "Macbook Air 13",
//   base_price: "38.00",
//   main_image: "/media/products/main_images/assignment_top_page_2_page-0001.jpg",
//   stock: 87,
//   type: "simple",
//   status: "draft",
//   is_featured: true,
//   view_count: 3,
//   avg_rating: "0.00",
//   total_reviews: 0,
//   brand: null,
//   category: {
//     id: 2,
//     name: "Computer",
//     slug: "computer",
//   },
//   store: {
//     id: 1,
//     store_name: "Vai Vai Electronics Ltd.",
//     slug: "vai-vai-electronics-ltd",
//   },
//   images: [
//     {
//       id: 1,
//       image: "/media/products/gallery/assignment_top_page_2_page-0001.jpg",
//     },
//     {
//       id: 2,
//       image: "/media/products/gallery/assignment_top_page_2_page-0001.jpg",
//     },
//     {
//       id: 3,
//       image: "/media/products/gallery/assignment_top_page_2_page-0001.jpg",
//     },
//     {
//       id: 4,
//       image: "/media/products/gallery/assignment_top_page_2_page-0001.jpg",
//     },
//     {
//       id: 5,
//       image: "/media/products/gallery/assignment_top_page_2_page-0001.jpg",
//     },
//   ],
//   attributes: [
//     {
//       id: 1,
//       name: "rom",
//       is_variation: true,
//     },
//   ],
//   variants: [
//     {
//       id: 1,
//       sku: "macbookair14",
//       variant_name: "2TB",
//       price: "390.00",
//       discount_price: "10.00",
//       stock: 29,
//       image: "/media/products/variant_images/WhatsApp_Image_2025-12-27_at_11.08.16_PM.jpeg",
//     },
//     {
//       id: 2,
//       sku: "macbookair14-512",
//       variant_name: "512GB",
//       price: "250.00",
//       discount_price: "20.00",
//       stock: 45,
//       image: "/media/products/variant_images/WhatsApp_Image_2025-12-27_at_11.08.16_PM.jpeg",
//     },
//     {
//       id: 3,
//       sku: "macbookair14-1tb",
//       variant_name: "1TB",
//       price: "320.00",
//       discount_price: "15.00",
//       stock: 32,
//       image: "/media/products/variant_images/WhatsApp_Image_2025-12-27_at_11.08.16_PM.jpeg",
//     },
//   ],
//   offers: ["Enjoy Additional 12% OFF up to ৳2025 with Visa & MasterCard", "Free Delivery on orders above ৳500"],
//   specialOffer: {
//     title: "YEAR END SALE",
//     description: "Save up to 60% on selected items",
//   },
//   reviews: [],
//   onSale: true,
//   // specifications: [
//   //   { category: "Processor", value: "Apple M2" },
//   //   { category: "RAM", value: "8GB" },
//   //   { category: "Storage", value: "256GB SSD" },
//   //   { category: "Display", value: "13.3 inch Retina" },
//   //   { category: "Battery", value: "Up to 15 hours" },
//   //   { category: "Weight", value: "1.24 kg" },
//   // ],
//   keyFeatures: [
//     "Powerful Apple M2 chip with 8-core CPU",
//     "Up to 10-core GPU for smooth graphics",
//     "Fast SSD storage for quick boot and file access",
//     "Stunning 13.3-inch Retina display",
//     "All-day battery life up to 15 hours",
//     "MacBook Air weighs just 1.24 kg",
//     "Fanless design for silent operation",
//     "Thunderbolt 3 ports for fast connectivity",
//   ],
// }
