'use client';

import { useRouter, useParams } from 'next/navigation';
import { showError } from "@/features/globals/global-message-store";
import { CreatePersonaChat, FindPersonaByID } from "@/features/persona-page/persona-services/persona-service";
import { DisplayError } from "@/features/ui/error/display-error";
import { LoadingIndicator } from "@/features/ui/loading";
import { PersonaModel } from "@/features/persona-page/persona-services/models";
import React, { useEffect, useState } from 'react';

const CreatePersonaChatPage = () => {
  const { personaId } = useParams();
  const [persona, setPersona] = useState<PersonaModel | null>(null);
  const [errors, setErrors] = useState<string[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPersona = async () => {
      if (!personaId) {
        setErrors(['Persona ID is missing']);
        return;
      }

      const personasResponse = await FindPersonaByID(personaId+"");
      if (personasResponse.status !== "OK") {
        setErrors(personasResponse.errors.map(e => e.message));
        return;
      }
      setPersona(personasResponse.response);
    };

    fetchPersona();
  }, [personaId]);

  useEffect(() => {
    const startChat = async () => {
      if (!persona) return;

      const response = await CreatePersonaChat(persona.id);
      if (response.status === "OK") {
        router.push(`/chat/${response.response.id}`);
      } else {
        showError(response.errors.map((e) => e.message).join(", "));
      }
    };

    startChat();
  }, [persona, router]);

  if (errors) {
    return <DisplayError errors={[{message: errors+""}]} />;
  }

  if (!persona) {
    return <LoadingIndicator isLoading={true} />;
  }

  return <LoadingIndicator isLoading={true} />;
};

export default CreatePersonaChatPage;