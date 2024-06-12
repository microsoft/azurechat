import { ChatHome } from "@/features/chat-home-page/chat-home";
import { FindAllNewsArticles } from "@/features/common/services/news-service/news-service";
import { FindAllExtensionForCurrentUser } from "@/features/extensions-page/extension-services/extension-service";
import { FindAllPersonaForCurrentUser } from "@/features/persona-page/persona-services/persona-service";
import { DisplayError } from "@/features/ui/error/display-error";

export default async function Home() {
  const [personaResponse, extensionResponse, newsResponse] = await Promise.all([
    FindAllPersonaForCurrentUser(),
    FindAllExtensionForCurrentUser(),
    FindAllNewsArticles(),
  ]);

  if (personaResponse.status !== "OK") {
    return <DisplayError errors={personaResponse.errors} />;
  }

  if (extensionResponse.status !== "OK") {
    return <DisplayError errors={extensionResponse.errors} />;
  }

  if (newsResponse.status !== "OK") {
    return <DisplayError errors={newsResponse.errors} />;
  }

  return (
    <ChatHome
      personas={personaResponse.response}
      extensions={extensionResponse.response}
      news={newsResponse.response}
    />
  );
}
