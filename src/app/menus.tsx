import { Home, UserCog, Bookmark, CloudUpload, SpellCheck2 } from "lucide-react"

export interface MenuItem {
  name: string
  href: string
  icon: React.ElementType
  ariaLabel: string
  condition?: "unauthenticated" | "authenticated"
}

export const menuItems: MenuItem[] = [
  { name: "Home", href: "/chat", icon: Home, ariaLabel: "Navigate to home page", condition: "unauthenticated" },
  {
    name: "Settings",
    href: "/settings/details",
    icon: UserCog,
    ariaLabel: "Navigate to settings",
    condition: "authenticated",
  },
  {
    name: "Prompt Guide",
    href: "/prompt-guide",
    icon: Bookmark,
    ariaLabel: "Navigate to prompt guide",
    condition: "authenticated",
  },
  {
    name: "What's New",
    href: "/whats-new",
    icon: CloudUpload,
    ariaLabel: "Navigate to what's new page",
    condition: "authenticated",
  },
  {
    name: "Factual Errors",
    href: "/hallucinations",
    icon: SpellCheck2,
    ariaLabel: "Help with factual errors",
    condition: "authenticated",
  },
]
