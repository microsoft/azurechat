"use client"

import { usePathname } from "next/navigation"

import { MenuItem } from "@/components/menu"

type Props = {
  url: string
  icon: JSX.Element
  text: string
}
export const SettingsMenuItem = ({ url, icon, text }: Props): JSX.Element => {
  const pathname = usePathname()

  return (
    <MenuItem href={url} key={url} isSelected={pathname === url}>
      {icon}
      <span>{text}</span>
    </MenuItem>
  )
}
