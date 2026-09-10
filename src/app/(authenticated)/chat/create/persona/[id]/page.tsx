import { DisplayError } from "@/features/ui/error/display-error";
import {
    CreatePersonaChat,
    FindPersonaForCurrentUser
} from "@/features/persona-page/persona-services/persona-service";
import {RedirectToChatThread} from "@/features/common/navigation-helpers";

interface HomeParams {
    params: {
        id: string;
    };
}

export default async function Home(props: HomeParams) {
    const { id } = props.params;
    const personaResponse = await FindPersonaForCurrentUser(id);
    if (personaResponse.status !== "OK") {
        return <DisplayError errors={personaResponse.errors} />;
    }
    const response = await CreatePersonaChat(id);
    if (response.status === "OK") {
        RedirectToChatThread(response.response.id);
    } else {
        return <DisplayError errors={response.errors} />;
    }
}