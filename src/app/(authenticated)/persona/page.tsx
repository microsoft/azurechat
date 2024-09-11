import { FindAllExtensionForCurrentUser } from "@/features/extensions-page/extension-services/extension-service";
import { ChatPersonaPage } from "@/features/persona-page/persona-page";
import { FindAllPersonaForCurrentUser } from "@/features/persona-page/persona-services/persona-service";
import { DisplayError } from "@/features/ui/error/display-error";

export default async function Home() {
  const [personasResponse, extensionsResponse] =
    await Promise.all([
      FindAllPersonaForCurrentUser(),
      FindAllExtensionForCurrentUser()
    ]);
  if (personasResponse.status !== "OK") {
    return <DisplayError errors={personasResponse.errors} />;
  }
  if (extensionsResponse.status !== "OK") {
    return <DisplayError errors={extensionsResponse.errors} />;
  }
  return <ChatPersonaPage personas={personasResponse.response} extensions={extensionsResponse.response} />;
}
