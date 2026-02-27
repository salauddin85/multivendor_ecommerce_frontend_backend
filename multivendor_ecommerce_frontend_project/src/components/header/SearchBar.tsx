"use client"
import { Search, Loader2, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { search_products } from "@/actions/product.action";
import Link from "next/link";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Close results on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = async () => {
    setIsLoading(true);
    setShowResults(true);
    try {
      const res = await search_products(query);
      if (!res.error) {
        setResults(res.data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  return (
    <div className="relative w-full md:max-w-xl px-4" ref={searchRef}>
      <div className="relative">
        <InputGroup className="border border-white/20 rounded-lg overflow-hidden bg-white/95 backdrop-blur-md shadow-lg transition-all ">
          <InputGroupInput
            type="text"
            name="q"
            value={query}
            autoComplete="off"
            className="px-4 py-2 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 placeholder:text-gray-400 font-medium"
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="What are you looking for?"
          />
          
          <div className="flex items-center  capitalize">
            {isLoading ? (
               <Loader2 className="animate-spin text-primary size-5 h-full mr-2" />
            ) : query && (
               <button 
                onClick={() => setQuery("")}
                className="hover:text-primary transition-colors cursor-pointer mr-2"
               >
                 <X size={18} className="text-gray-400" />
               </button>
            )}
            
            <InputGroupButton
              type="button"
              size="sm"
              variant="secondary"
              className="bg-primary text-white rounded-md border-none px-5 py-2 m-[2px] md:m-1 h-[calc(100%-8px)] cursor-pointer hover:bg-orange-600 transition-all font-semibold active:scale-95"
              onClick={handleSearch}
            >
              <Search size={20} />
            </InputGroupButton>
          </div>
        </InputGroup>

        {/* Floating Search Results */}
        {showResults && (query.trim().length >= 2) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-primary size-8" />
                <p className="text-sm font-medium">Searching for "{query}"...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3">Products</p>
                </div>
                {results.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => setShowResults(false)}
                    className="flex items-center gap-4 p-3 hover:bg-orange-50 transition-colors group border-b border-gray-50 last:border-0"
                  >
                    <div className="relative size-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                      {product.main_image ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${product.main_image}`}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Search size={16} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 truncate group-hover:text-primary transition-colors">
                        {product.title}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="text-primary font-bold">
                           ৳{product.type === "variable" ? product.variants?.price : product.base_price}
                        </span>
                        <span className="text-[10px] text-gray-300">•</span>
                        <span className="truncate">{product.category}</span>
                      </p>
                    </div>
                  </Link>
                ))}
                <button 
                  onClick={handleSearch}
                  className="w-full p-3 bg-gray-50 text-gray-600 text-xs font-bold hover:bg-primary hover:text-white transition-all text-center flex items-center justify-center gap-2"
                >
                   View All Results for "{query}"
                   <Search size={14} />
                </button>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-sm text-gray-800 font-bold mb-1">No results found</p>
                <p className="text-xs text-gray-500">We couldn't find anything matching "{query}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
