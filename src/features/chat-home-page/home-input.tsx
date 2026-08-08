"use client";

import { chatStore } from "@/features/chat-page/chat-store";
import { CreateChatThread } from "@/features/chat-page/chat-services/chat-thread-service";
import { CreatePersonaChat } from "@/features/persona-page/persona-services/persona-service";
import { PersonaModel } from "@/features/persona-page/persona-services/models";
import { LoadingIndicator } from "@/features/ui/loading";
import { showError } from "@/features/globals/global-message-store";
import { ArrowUp, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

export const HomeInput = () => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const start = async () => {
    const text = value.trim();
    if (text.length === 0 || busy) return;
    setBusy(true);
    const response = await CreateChatThread();
    if (response.status === "OK") {
      chatStore.updateInput(text);
      chatStore.autoSubmitPending = true;
      router.push(`/chat/${response.response.id}`);
    } else {
      setBusy(false);
      showError(response.errors.map((e) => e.message).join("\n"));
    }
  };

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        start();
      }}
    >
      <div className="flex items-center gap-2 rounded-[28px] border dark:border-transparent bg-background dark:bg-muted pl-5 pr-2 py-2 shadow-[0_2px_12px_rgba(0,0,0,0.06)] focus-within:shadow-[0_2px_16px_rgba(0,0,0,0.10)] transition-shadow">
        <input
          autoFocus
          value={value}
          disabled={busy}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask anything"
          aria-label="Start a new chat"
          className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || value.trim().length === 0}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30"
        >
          {busy ? (
            <LoadingIndicator isLoading={true} />
          ) : (
            <ArrowUp size={18} />
          )}
        </button>
      </div>
    </form>
  );
};

export const PersonaSuggestion: FC<{ persona: PersonaModel }> = ({
  persona,
}) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const start = async () => {
    if (busy) return;
    setBusy(true);
    const response = await CreatePersonaChat(persona.id);
    if (response.status === "OK") {
      router.push(`/chat/${response.response.id}`);
    } else {
      setBusy(false);
      showError(response.errors.map((e) => e.message).join("\n"));
    }
  };

  return (
    <button
      onClick={start}
      disabled={busy}
      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-60"
    >
      {busy ? (
        <LoadingIndicator isLoading={true} />
      ) : (
        <MessageCircle size={18} className="shrink-0" />
      )}
      <span className="truncate">
        <span className="text-foreground">{persona.name}</span>
        {persona.description ? ` — ${persona.description}` : ""}
      </span>
    </button>
  );
};
