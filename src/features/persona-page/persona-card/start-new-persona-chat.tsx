"use client";

import { RedirectToChatThread } from "@/features/common/navigation-helpers";
import { showError } from "@/features/globals/global-message-store";
import { LoadingIndicator } from "@/features/ui/loading";
import { MessageCircle } from "lucide-react";
import { FC, useState } from "react";
import { Button } from "../../ui/button";
import { PersonaModel } from "../persona-services/models";
import { CreatePersonaChat } from "../persona-services/persona-service";

interface Props {
  persona: PersonaModel;
}

export const StartNewPersonaChat: FC<Props> = (props) => {
  const { persona } = props;
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      className="flex-1 gap-3"
      onClick={async () => {
        setIsLoading(true);
        const response = await CreatePersonaChat(persona.id);
        if (response.status === "OK") {
          RedirectToChatThread(response.response.id);
        } else {
          showError(response.errors.map((e) => e.message).join(", "));
        }
        setIsLoading(false);
      }}
    >
      {isLoading ? (
        <LoadingIndicator isLoading={isLoading} />
      ) : (
        <MessageCircle size={18} />
      )}
      Start chat
    </Button>
  );
};
