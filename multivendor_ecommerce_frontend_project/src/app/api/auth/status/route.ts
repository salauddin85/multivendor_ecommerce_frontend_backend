import { cookies } from "next/headers";

export async function GET() {
  const userType = (await cookies()).get("user_type")?.value || null;
  return Response.json({ userType });
}
