"use client"

import { useMenuContext } from "@/features/main-menu/menu-context"

export const ChatMenuContainer = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { isMenuOpen } = useMenuContext()
  return <>{isMenuOpen ? children : null}</>
}
