"use client";

import { SessionProvider } from "next-auth/react";
import { SpeechProvider } from "./chat/chat-speech/speech-context";
import { GlobalErrorProvider } from "./global-error/global-error-context";
import { MenuProvider } from "./menu/menu-context";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <GlobalErrorProvider>
        <MenuProvider>
          <SpeechProvider>{children}</SpeechProvider>
        </MenuProvider>
      </GlobalErrorProvider>
    </SessionProvider>
  );
};
