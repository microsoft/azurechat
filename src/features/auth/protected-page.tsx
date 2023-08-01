import { redirect } from "next/navigation";
import { FC } from "react";
import { userSession } from "./helpers";

interface Props {
  children: React.ReactNode;
}

export const ProtectedPage: FC<Props> = async ({ children }) => {
  const _user = await userSession();
  if (!_user) {
    redirect("/");
  }
  return <>{children}</>;
};
