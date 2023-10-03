"use client";

import { SessionProvider } from "next-auth/react";
import { SpeechProvider } from "./chat/chat-speech/speech-context";
import { GlobalMessageProvider } from "./global-message/global-message-context";
import { MenuProvider } from "./menu/menu-context";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <GlobalMessageProvider>
        <MenuProvider>
          <SpeechProvider>{children}</SpeechProvider>
        </MenuProvider>
      </GlobalMessageProvider>
    </SessionProvider>
  );
};
