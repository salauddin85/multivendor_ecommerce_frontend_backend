"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export async function get_role(roleId: string) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  try {
    const res = await fetch(
      `${BASE_URL}/api/authorization/v1/role_permissions/${roleId}/`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        next: { tags: [`role-${roleId}`] },
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
        message: response.message || "Failed to fetch role",
        data: response.data,
      };
    }
  } catch (err: any) {
    return {
      error: true,
      message: err?.message || "Network error",
      data: null,
    };
  }
}

export async function get_role_list() {
   const cookieStore = await cookies();
   const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(
      `${BASE_URL}/api/authorization/v1/role_permissions/data/`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        next: { tags: ["role-list"] },
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
        message: response.message || "Failed to fetch roles",
        data: response.data,
      };
    }
  } catch (err:any) {
    return {
      error: true,
      message: err?.message || "Network error",
      data: null,
    };
  }
}

export async function get_all_users() {
   const cookieStore = await cookies();
   const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(
      `${BASE_URL}/api/authorization/v1/view_all_users/`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        next: { tags: ["all-users"] },
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
        message: response.message || "Failed to fetch users",
        data: response.data,
      };
    }
  } catch (err:any) {
    return {
      error: true,
      message: err?.message || "Network error",
      data: null,
    };
  }
}

export async function get_permissions() {
   const cookieStore = await cookies();
   const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/authorization/v1/permissions/`, {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      next: { tags: ["all-permissions"] },
    });

    const response = await res.json();

    if (response.code === 200 && response.status === "success") {
      return {
        error: false,
        data: response.data,
      };
    } else {
      return {
        error: true,
        message: response.message || "Failed to fetch permissions",
        data: response.data,
      };
    }
  } catch (err:any) {
    return {
      error: true,
      message: err?.message || "Network error",
      data: null,
    };
  }
}

export async function create_permission(permissionData: any) {
   const cookieStore = await cookies();
   const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/authorization/v1/permissions/`, {
      method: "POST",
      credentials: "include",
      headers: {
        Cookie: `access_token=${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: permissionData.name,
        code: permissionData.name,
      }),
    });

    const response = await res.json();

    if (
      (response.code === 200 || response.code === 201) &&
      response.status === "success"
    ) {
      updateTag("all-permissions")
      return {
        success: true,
        message: "Permission created successfully",
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to create permission",
        data: response,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
      data: null,
    };
  }
}

export async function create_role(roleData: any) {
   const cookieStore = await cookies();
   const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(
      `${BASE_URL}/api/authorization/v1/role_permissions/`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          Cookie: `access_token=${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: roleData.name,
          permissions: roleData.permissions,
        }),
      }
    );

    const response = await res.json();

    if (
      (response.code === 200 || response.code === 201) &&
      response.status === "success"
    ) {
      updateTag("role-list",);
      return {
        success: true,
        message: "Role created successfully",
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to create role",
        data: null,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
      data: null,
    };
  }
}

export async function update_role_permissions(roleId: string, permissionData: any) {
   const cookieStore = await cookies();
   const accessToken = cookieStore.get("access_token")?.value;
  
  try {
    const res = await fetch(
      `${BASE_URL}/api/authorization/v1/single_role_permissions/${roleId}/`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          Cookie: `access_token=${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: permissionData.name,
          permissions: permissionData.permissions,
        }),
      }
    );

    const response = await res.json();

    if (
      (response.code === 200 || response.code === 201) &&
      response.status === "success"
    ) {
      updateTag(`role-${roleId}`);
      updateTag("role-list");

      return {
        success: true,
        message: "Role updated successfully",
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to update role",
        data: null,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
      data: null,
    };
  }
}

export async function delete_role(roleId: string) {
   const cookieStore = await cookies();
   const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(
      `${BASE_URL}/api/authorization/v1/single_role_permissions/${roleId}/`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          Cookie: `access_token=${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const response = await res.json();

    if (response.code === 200 && response.status === "success") {
      updateTag("role-list");
      return {
        success: true,
        message: "Role deleted successfully",
        data: null,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to delete role",
        data: null,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
      data: null,
    };
  }
}

export async function add_members_to_role(roleId: string, userIds: any) {
   const cookieStore = await cookies();
   const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(
      `${BASE_URL}/api/authorization/v1/assign_role_users/`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          Cookie: `access_token=${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          users: userIds,
          role: roleId,
        }),
      }
    );

    const response = await res.json();

    if (
      (response.code === 200 || response.code === 201) &&
      response.status === "success"
    ) {
      updateTag(`role-${roleId}`);
      updateTag("role-list");
      return {
        success: true,
        message: "Members added to role successfully",
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to add members",
        data: null,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
      data: null,
    };
  }
}

export async function remove_member_from_role(userId: string, roleId: string) {
   const cookieStore = await cookies();
   const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(
      `${BASE_URL}/api/authorization/v1/assign_role_user/`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          Cookie: `access_token=${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          role_id: roleId,
        }),
      }
    );

    const response = await res.json();

    if (response.code === 200 && response.status === "success") {
      updateTag(`role-${roleId}`);
      updateTag("role-list");
      return {
        success: true,
        message: "Member removed successfully",
        data: null,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to remove member",
        data: null,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
      data: null,
    };
  }
}
export async function get_me() {
   const cookieStore = await cookies();
   const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/authorization/v1/me/`,
      {
        credentials: "include",
        headers: { Cookie: `access_token=${accessToken}` },
        next: { tags: ["get-me"] },
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
        message: response.data.message || "Verification failed",
        data: response.data,
      };
    }
  } catch (err: any) {
    return {
      error: true,
      message: err?.response?.data?.message || err?.message || "Network Error",
      data: err?.response?.data || null,
    };
  }
}