import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function MSGraph(req: any) {
  const token = await getToken({ req });

  // Modify the fetch request to match your needs
  const res = await fetch(
    "https://graph.microsoft.com/v1.0/me?$select=department",
    {
      // Add the  access token to your request
      headers: { Authorization: `Bearer ${token?.accessToken}` },
    }
  );

  const data = await res.json();

  console.log("current userdata", data);

  return NextResponse.json({ data });
}
