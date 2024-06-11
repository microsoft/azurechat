import { ChatHome } from "@/features/chat-home-page/chat-home";
import { FindAllExtensionForCurrentUser } from "@/features/extensions-page/extension-services/extension-service";
import { FindAllPersonaForCurrentUser } from "@/features/persona-page/persona-services/persona-service";
import { DisplayError } from "@/features/ui/error/display-error";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

export default async function Home() {
  const cookieHeader = cookies().toString();
  const currentUser = await fetchCurrentUserDetails(cookieHeader);

  const [personaResponse, extensionResponse] = await Promise.all([
    FindAllPersonaForCurrentUser(currentUser.data.department),
    FindAllExtensionForCurrentUser(),
  ]);

  if (personaResponse.status !== "OK") {
    return <DisplayError errors={personaResponse.errors} />;
  }

  if (extensionResponse.status !== "OK") {
    return <DisplayError errors={extensionResponse.errors} />;
  }

  function redirectToPersona() {
    redirect("/persona");
  }

  return (
    <ChatHome
      personas={personaResponse.response}
      extensions={extensionResponse.response}
      redirectToPersona={redirectToPersona}
    />
  );
}
