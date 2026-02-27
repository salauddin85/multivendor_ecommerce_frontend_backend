"use client";

import { useRouter, useSearchParams } from "next/navigation";

type PaginationData = {
  count: number;
  current_page: number;
  total_pages: number;
  next: string | boolean | null;  
  previous: string | boolean | null; 
  page_size?: number;
};

type PaginationProps = {
  paginationData: PaginationData;
  className?: string;
};

export default function Pagination({
  paginationData,
  className = "",
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!paginationData || paginationData.total_pages <= 1) return null;

  const { current_page, total_pages, next, previous } = paginationData;

  // Universal check for next/previous
  const hasNext = typeof next === 'string' 
    ? next !== null 
    : next === true;
  
  const hasPrevious = typeof previous === 'string'
    ? previous !== null
    : previous === true;

  const goToPage = (page: number) => {
    if (page !== current_page && page >= 1 && page <= total_pages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      const newUrl = `?${params.toString()}`;

      window.scrollTo({ top: 0, behavior: "smooth" });
      router.push(newUrl);
    }
  };

  const generatePageLinks = (): (number | "...")[] => {
    const rangeWithDots: (number | "...")[] = [];

    if (current_page > 2) {
      rangeWithDots.push(1);
      if (current_page > 3) rangeWithDots.push("...");
    }

    const delta = 1;
    for (
      let i = Math.max(1, current_page - delta);
      i <= Math.min(total_pages, current_page + delta);
      i++
    ) {
      rangeWithDots.push(i);
    }

    if (current_page < total_pages - 1) {
      if (current_page < total_pages - 2) rangeWithDots.push("...");
      rangeWithDots.push(total_pages);
    }

    return rangeWithDots;
  };

  return (
    <div className={`py-12 ${className}`}>
      <nav aria-label="Blog pagination">
        <ul className="flex flex-wrap justify-center items-center gap-2 mb-4">
          {/* Previous Button */}
          <li>
            <button
              className="inline-flex items-center cursor-pointer gap-2 px-6 py-2 border-2 border-orange-600 rounded-xl font-semibold text-orange-600 transition-transform duration-300 hover:bg-orange-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => hasPrevious && goToPage(current_page - 1)}
              disabled={!hasPrevious}
              aria-label="Previous page"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-300"
              >
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </button>
          </li>

          {/* Page Numbers */}
          {generatePageLinks().map((page, i) =>
            page === "..." ? (
              <li
                key={`ellipsis-${i}`}
                className="w-10 h-10 flex items-center justify-center text-gray-400 font-semibold text-lg"
              >
                ···
              </li>
            ) : (
              <li key={page}>
                <button
                  className={`w-11 h-11 flex items-center cursor-pointer justify-center rounded-lg border-2 border-gray-200 font-semibold text-gray-700 transition-transform duration-300 hover:border-orange-600 hover:text-white-600 ${
                    page === current_page
                      ? "bg-gradient-to-tr from-orange-500 to-orange-700 text-white shadow-lg scale-105"
                      : ""
                  }`}
                  onClick={() => goToPage(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === current_page ? "page" : undefined}
                >
                  {page}
                </button>
              </li>
            )
          )}

          {/* Next Button */}
          <li>
            <button
              className="inline-flex cursor-pointer items-center gap-2 px-6 py-2 border-2 border-orange-600 rounded-xl font-semibold text-orange-600 transition-transform duration-300 hover:bg-orange-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => hasNext && goToPage(current_page + 1)}
              disabled={!hasNext}
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-300"
              >
                <path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </li>
        </ul>

        {/* Page Info */}
        <div className="flex justify-center">
          <div className="px-6 py-3 bg-gray-100 rounded-lg border-2 border-gray-200 text-gray-700 font-medium shadow-sm">
            Page{" "}
            <span className="text-orange-600 font-bold">{current_page}</span> of{" "}
            <span className="text-orange-600 font-bold">{total_pages}</span>
          </div>
        </div>
      </nav>
    </div>
  );
}