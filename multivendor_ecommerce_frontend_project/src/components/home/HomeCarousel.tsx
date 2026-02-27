"use client";

import { ReactNode } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import Image from "next/image";

const HomeCarousel = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  return (
    <>
      <Carousel
        className="relative grow "
        plugins={[Autoplay({ delay: 5000 })]}
        opts={{ loop: true }}
      >
        <CarouselContent>
          {data.map((item, i) => (
            <CarouselItem key={i} className="">
              <div className="relative rounded-md ">
                <Link href={`/products/category/${item.category?.slug}`}>
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${item.image}`}
                    alt={item.category?.name || "Carousel slide"}
                    width={1280}
                    height={720}
                    className="object-contain"
                  />
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </>
  );
};

export default HomeCarousel;
