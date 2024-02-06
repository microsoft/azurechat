"use client";
import { SessionProvider } from "next-auth/react";

export const AuthenticatedProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <SessionProvider>{children}</SessionProvider>;
};
