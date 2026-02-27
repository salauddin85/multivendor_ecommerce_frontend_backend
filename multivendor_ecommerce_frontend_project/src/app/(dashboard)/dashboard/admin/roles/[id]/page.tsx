import RoleDetailsPage from '@/components/Roles/RoleDetailsPage'
import { get_all_users, get_permissions, get_role } from '@/actions/authorization';
async function page({params}: any) {
  const { id } = await params;

   let rolesData = null;
   let users = null;
   let permissions = null;
    let error = null;
  
    try {
      const res = await get_role(id);
      if (res?.error) {
        error = res?.message || "Something went wrong.";
      } else {
        rolesData = res?.data;
      }
    } catch (err: any) {
      error = err?.message || "Unexpected error while fetching roles.";
    }
  
    try {
      const res = await get_all_users();
      if (res?.error) {
        error = res?.message || "Something went wrong.";
      } else {
        users = res?.data;
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
   
    
  return (
    <div>
      <RoleDetailsPage data={rolesData} users={users} permissions={permissions}/>
    </div>
  )
}

export default page