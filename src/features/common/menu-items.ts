import { HomeIcon, UserRoundCogIcon, BookMarkedIcon, CloudUploadIcon, SpellCheck2Icon } from "lucide-react"
import { Session } from "next-auth"

export type MenuItem = {
  name: string
  href: string
  icon: React.ElementType
  condition?: "unauthenticated" | "authenticated" | "admin"
  ariaLabel: string
}

export const MenuItems: MenuItem[] = [
  {
    name: "Home",
    href: "/chat",
    icon: HomeIcon,
    ariaLabel: "Navigate to home page",
    condition: "unauthenticated",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: UserRoundCogIcon,
    ariaLabel: "Navigate to settings",
    condition: "authenticated",
  },
  {
    name: "Prompt Guide",
    href: "/prompt-guide",
    icon: BookMarkedIcon,
    ariaLabel: "Navigate to prompt guide",
    condition: "authenticated",
  },
  {
    name: "What's New",
    href: "/whats-new",
    icon: CloudUploadIcon,
    ariaLabel: "Navigate to what's new page",
    condition: "authenticated",
  },
  {
    name: "Factual Errors",
    href: "/hallucinations",
    icon: SpellCheck2Icon,
    ariaLabel: "Help with factual errors",
    condition: "authenticated",
  },
]

export const validateCondition = (session: Session | null) => (link: MenuItem) => {
  if (link.condition === "authenticated" && !session?.user) return false
  return true
}
