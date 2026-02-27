// page.tsx
import ReviewsRatingList from "@/components/dashboard/admin/Products/Reviews/ReviewsRatingList";
import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";

type PageProps = {
  searchParams?: {
    page?: string;
  };
};

export default async function Page({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;

  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;

  let reviews_list = [];

  try {
    const response = await axiosInstance.get(
      `/api/reviews/v1/reviews/list/?page_size=100&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    reviews_list = response.data;
  } catch (error) {
    console.error("Failed to fetch reviews list:", error);
  }

  return (
    <div>
      <ReviewsRatingList reviews_list={reviews_list} />
    </div>
  );
}