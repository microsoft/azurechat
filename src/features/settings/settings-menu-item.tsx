"use client"

import { ChevronUp } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { MenuHeader, MenuItem } from "@/components/menu"
import Typography from "@/components/typography"

type MenuItemProps = {
  url: string
  icon: JSX.Element
  text: string
  items?: MenuItemProps[]
  className?: string
}
export const SettingsMenuItem = ({ url, icon, text, items, className }: MenuItemProps): JSX.Element => {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(pathname.startsWith(url))

  if (!items?.length)
    return (
      <MenuItem
        href={url}
        key={url}
        isSelected={url === "/settings" ? url === pathname : pathname.startsWith(url)}
        className={className}
      >
        {icon}
        <Typography variant="span">{text}</Typography>
      </MenuItem>
    )

  return (
    <>
      <MenuHeader
        key={url}
        onClick={() => setExpanded(!expanded)}
        className={`${
          expanded ? "rounded-t-md border-b-2 border-altBorder bg-backgroundShade" : "rounded-md"
        } align-center cursor-pointer p-2 transition-colors hover:border-altButtonHover hover:bg-backgroundShade`}
      >
        <Typography variant="span" className="flex gap-2">
          {icon} {text}
        </Typography>
        {items && (
          <ChevronUp size={24} className={`${expanded ? "" : "rotate-180"} transition-rotate mr-4 duration-300`} />
        )}
      </MenuHeader>
      {items &&
        expanded &&
        items.map(item => (
          <SettingsMenuItem
            key={`${url}${item.url}`}
            url={`${url}${item.url}`}
            icon={item.icon}
            text={item.text}
            items={item.items}
            className="ml-6"
          />
        ))}
    </>
  )
}
