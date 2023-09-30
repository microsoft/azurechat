"use client";

import { SessionProvider } from "next-auth/react";
import { SpeechProvider } from "./chat/chat-speech/speech-context";
import { MenuProvider } from "./menu/menu-context";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <MenuProvider>
        <SpeechProvider>{children}</SpeechProvider>
      </MenuProvider>
    </SessionProvider>
  );
};
