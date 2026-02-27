"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProductGalleryProps {
  images: string[]
  activeIndex?: number
  onImageClick?: (index: number) => void
}

export default function ProductGallery({ images, activeIndex, onImageClick }: ProductGalleryProps) {
  const [mainImageIndex, setMainImageIndex] = useState(0)

  // Sync internal state with activeIndex only when it changes
  useEffect(() => {
    if (activeIndex !== undefined && activeIndex >= 0 && activeIndex < images.length) {
      setMainImageIndex(activeIndex);
    }
  }, [activeIndex, images.length]);

  const nextImage = () => {
    setMainImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setMainImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

 return (
   <div className="flex gap-4">
     {/* Thumbnail Gallery (LEFT) */}
     <div className="hidden md:flex flex-col overflow-y-auto justify-center gap-6 items-center  py-4">
       {images.map((image, index) => (
         <button
           key={index}
           onClick={() => {
             setMainImageIndex(index)
             if (onImageClick) onImageClick(index)
           }}
           className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
             mainImageIndex === index
               ? "border-primary"
               : "border-gray-300 hover:border-gray-400"
           }`}
         >
           <Image
             src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${image}` || "/placeholder.svg"}
             alt={`Thumbnail ${index + 1}`}
             width={64}
             height={64}
             className="w-full h-full object-cover"
           />
         </button>
       ))}
     </div>

     {/* Main Image (RIGHT) */}
     <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square flex-1 flex items-center justify-center group">
       <Image
         src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${images[mainImageIndex]}` || "/placeholder.svg"}
         alt="Product"
         className="object-cover w-full h-full"
         width={500}
         height={500}
       />

       {/* Navigation Buttons */}
       <button
         onClick={prevImage}
         className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition"
       >
         <ChevronLeft size={24} />
       </button>

       <button
         onClick={nextImage}
         className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition"
       >
         <ChevronRight size={24} />
       </button>

       {/* Image Counter */}
       <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-semibold">
         {mainImageIndex + 1}/{images.length}
       </div>
     </div>
   </div>
 );

}
