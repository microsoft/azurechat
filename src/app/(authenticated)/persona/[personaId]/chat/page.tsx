import { RedirectToChatThread } from "@/features/common/navigation-helpers";
import { showError } from "@/features/globals/global-message-store";
import { CreatePersonaChat, FindPersonaByID } from "@/features/persona-page/persona-services/persona-service";
import { DisplayError } from "@/features/ui/error/display-error";
import { LoadingIndicator } from "@/features/ui/loading";

interface Props {
  params: {
    personaId: string;
  };
}

export default async function CreatePersonaChatPage({ params }: Props) {
  const personasResponse = await FindPersonaByID(params.personaId);
   
  if (personasResponse.status !== "OK") {
    return <DisplayError errors={personasResponse.errors} />;
  }
  const response = await CreatePersonaChat(personasResponse.response.id);
  if (response.status === "OK") {
    RedirectToChatThread(response.response.id);
  } else {
    showError(response.errors.map((e) => e.message).join(", "));
  }

  return  <LoadingIndicator isLoading={true} />
}
