"use server"

export async function get_product(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/products/v1/products/${slug}/`,
      {
        method: "GET",
        credentials: "include",
        next: { tags: [`news-${slug}`] },
      }
    );

    const response = await res.json();

    if (response.code === 200 && response.status === "success") {
      return {
        error: false,
        data: response.data,
      };
    } else {
      return {
        error: true,
        message: response.message || "Failed to fetch product",
        data: response.data,
      };
    }
  } catch (err: any) {
    return {
      error: true,
      message: err?.message || "Network error",
      data: err?.data,
    };
  }
}

export async function get_products(currentPage = 1) {

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/products/v1/products/?page_size=10&page=${currentPage}`,
      {
        method: "GET",
      }
    );

    const response = await res.json();
    if (response.code === 200 && response.status === "success") {
      return {
        error: false,
        data: response,
      };
    } else {
      return {
        error: true,
        message: response.message || "Failed to fetch products",
        data: response.data,
      };
    }
  } catch (err: any) {
    return {
      error: true,
      message: err?.message || "Network error",
      data: err?.data,
    };
  }
}

export async function search_products(query: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/products/v1/products/?search=${query}&page_size=10`,
      {
        method: "GET",
      }
    );

    const response = await res.json();
    if (response.code === 200 && response.status === "success") {
      return {
        error: false,
        data: response.data,
      };
    } else {
      return {
        error: true,
        message: response.message || "Failed to search products",
        data: [],
      };
    }
  } catch (err: any) {
    return {
      error: true,
      message: err?.message || "Network error",
      data: [],
    };
  }
}

export async function get_top_categories() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/products/v1/products/top_categories/`,
      {
        method: "GET",
        credentials: "include",
        next: { tags: ["top_categories"] },
      }
    );

    const response = await res.json();
    if (response.code === 200 && response.status === "success") {
      return {
        error: false,
        data: response.data,
      };
    } else {
      return {
        error: true,
        message: response.message || "Failed to fetch top categories",
        data: [],
      };
    }
  } catch (err: any) {
    return {
      error: true,
      message: err?.message || "Network error",
      data: [],
    };
  }
}

export async function get_best_selling_products() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/products/v1/products/best_selling/`,
      {
        method: "GET",
        credentials: "include",
        next: { tags: ["best_selling_products"] },
      }
    );

    const response = await res.json();
    if (response.code === 200 && response.status === "success") {
      return {
        error: false,
        data: response.data,
      };
    } else {
      return {
        error: true,
        message: response.message || "Failed to fetch best selling products",
        data: [],
      };
    }
  } catch (err: any) {
    return {
      error: true,
      message: err?.message || "Network error",
      data: [],
    };
  }
}

export async function get_latest_products() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/products/v1/products/latest/`,
      {
        method: "GET",
        credentials: "include",
        next: { tags: ["latest_products"] },
      }
    );

    const response = await res.json();
    if (response.code === 200 && response.status === "success") {
      return {
        error: false,
        data: response.data,
      };
    } else {
      return {
        error: true,
        message: response.message || "Failed to fetch latest products",
        data: [],
      };
    }
  } catch (err: any) {
    return {
      error: true,
      message: err?.message || "Network error",
      data: [],
    };
  }
}

export async function get_carousel_images() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/catalog/v1/carousel_images/`,
      {
        method: "GET",
        next: { tags: ["carousel_images"] },
      }
    );

    const response = await res.json();
    if (response.code === 200 && response.status === "success") {
      return {
        error: false,
        data: response.data,
      };
    } else {
      return {
        error: true,
        message: response.message || "Failed to fetch carousel images",
        data: [],
      };
    }
  } catch (err: any) {
    return {
      error: true,
      message: err?.message || "Network error",
      data: [],
    };
  }
}

export async function get_category_grid_images() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/catalog/v1/category_grid_images/`,
      {
        method: "GET",
        next: { tags: ["category_grid_images"] },
      }
    );

    const response = await res.json();
    if (response.code === 200 && response.status === "success") {
      return {
        error: false,
        data: response.data,
      };
    } else {
      return {
        error: true,
        message: response.message || "Failed to fetch category grid images",
        data: [],
      };
    }
  } catch (err: any) {
    return {
      error: true,
      message: err?.message || "Network error",
      data: [],
    };
  }
}