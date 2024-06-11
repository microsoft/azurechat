import { ChatPersonaPage } from "@/features/persona-page/persona-page";
import { FindAllPersonaForCurrentUser } from "@/features/persona-page/persona-services/persona-service";
import { DisplayError } from "@/features/ui/error/display-error";
import { cookies } from "next/headers";

async function fetchCurrentUserDetails(cookieHeader: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/msgraph`, {
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Microsoft Graph data");
  }

  const data = await res.json();
  return data;
}

async function fetchAllDepartments(cookieHeader: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/users`, {
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Microsoft Graph data");
  }

  const data = await res.json();
  return data;
}

export default async function Home() {
  const cookieHeader = cookies().toString();
  const msGraphData = await fetchCurrentUserDetails(cookieHeader);
  const allDepartments = await fetchAllDepartments(cookieHeader);

  console.log(allDepartments);

  const [personasResponse] = await Promise.all([
    FindAllPersonaForCurrentUser(msGraphData.data.department),
  ]);

  if (personasResponse.status !== "OK") {
    return <DisplayError errors={personasResponse.errors} />;
  }
  return (
    <ChatPersonaPage
      personas={personasResponse.response}
      departments={allDepartments.data}
    />
  );
}
