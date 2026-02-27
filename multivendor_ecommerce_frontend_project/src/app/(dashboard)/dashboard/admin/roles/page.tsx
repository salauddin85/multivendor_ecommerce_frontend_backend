import { get_permissions, get_role_list } from "@/actions/authorization";
import RolesPage from "@/components/Roles/RolesPage";
async function page() {
  let rolesData = null;
  let permissions = null;
  let error = null;

  try {
    const res = await get_role_list();
    if (res?.error) {
      error = res?.message || "Something went wrong.";
    } else {
      rolesData = res?.data;
    }
  } catch (err: any) {
    error = err?.message || "Unexpected error while fetching roles.";
  }
try {
      const res = await get_permissions();
      if (res?.error) {
        error = res?.message || "Something went wrong.";
      } else {
        permissions = res?.data;
      }
    } catch (err: any) {
      error = err?.message || "Unexpected error while fetching roles.";
    }
  
  if (error) {
    return (
      <div className="p-10 text-center text-red-500 text-lg">
        <p className="text-lg">Failed to load roles. Please try again.</p>
        <p>{error}</p>
      </div>
    );
  }

  return <div>
    <RolesPage rolesData={rolesData} permissions={permissions} />
  </div>;
}

export default page;
