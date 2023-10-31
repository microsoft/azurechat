"use client";

import { SessionProvider } from "next-auth/react";
import { GlobalMessageProvider } from "./global-message/global-message-context";
import { MenuProvider } from "./main-menu/menu-context";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <GlobalMessageProvider>
        <MenuProvider>{children}</MenuProvider>
      </GlobalMessageProvider>
    </SessionProvider>
  );
};
