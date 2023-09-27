"use client";

import { SessionProvider } from "next-auth/react";
import { MenuProvider } from "./menu/menu-context";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <MenuProvider>{children}</MenuProvider>
    </SessionProvider>
  );
};
