
import { get_me } from '@/actions/authorization';
import AdminDetailsPage from '@/components/Roles/AdminDetailsPage'

async function page() {
     let rolesData = null;
      let error = null;
    
      try {
        const res = await get_me();
        if (res?.error) {
          error = res?.message || "Something went wrong.";
        } else {
          rolesData = res?.data;
        }
      } catch (err: any) {
        error = err?.message || "Unexpected error while fetching profile.";
      }
      
      if (error) {
        return (
          <div className="p-10 text-center text-red-500 text-lg">
            <p className="text-lg">Failed to load profile. Please try again.</p>
            <p>{error}</p>
          </div>
        );
      }
  return (
    <div>
        <AdminDetailsPage data={rolesData}/>
    </div>
  )
}

export default page