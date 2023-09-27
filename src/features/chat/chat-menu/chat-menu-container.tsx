"use client";

import { useMenuContext } from "@/features/menu/menu-context";

export const ChatMenuContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isMenuOpen } = useMenuContext();
  return <>{isMenuOpen ? children : null}</>;
};
