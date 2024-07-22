import { CloudUpload, HomeIcon, BookMarked, SpellCheck2, UserRoundCog } from "lucide-react"
import { Session } from "next-auth"
import React from "react"

import Typography from "@/components/typography"
import { ThemeSwitch } from "@/features/theme/theme-switch"

interface LinkItem {
  name: string
  href: string
  icon?: React.ElementType
  condition?: "unauthenticated" | "authenticated" | "admin"
}

const links: LinkItem[] = [
  { name: "Home", href: "/chat", icon: HomeIcon, condition: "unauthenticated" },
  { name: "Settings", href: "/settings", icon: UserRoundCog, condition: "authenticated" },
  { name: "Prompt Guide", href: "/prompt-guide", icon: BookMarked, condition: "authenticated" },
  { name: "What's new", href: "/whats-new", icon: CloudUpload, condition: "authenticated" },
  { name: "Factual Errors", href: "/hallucinations", icon: SpellCheck2, condition: "authenticated" },
]

const validateCondition = (link: LinkItem) => (session: Session | null) => {
  if (link.condition === "authenticated" && !session?.user) return false
  return true
}

export const NavBar: React.FC<{ session: Session | null }> = ({ session }) => {
  const visibleLinks = links.filter(link => !link.condition || validateCondition(link)(session))

  return (
    <nav aria-label="Main navigation" className="m:h-[44px] border-b-4 border-accent bg-backgroundShade">
      <div className="container hidden md:block">
        <div dir="ltr" className="grid grid-cols-6">
          {visibleLinks.map(link => (
            <div key={link.name} className="relative col-span-1 flex min-h-[40px] items-center justify-center">
              <a
                key={link.name}
                href={link.href}
                className="group flex w-full flex-1 items-center justify-center rounded-md p-2 font-medium ring-offset-background transition-colors focus-within:ring-transparent hover:bg-altBackground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {link.icon &&
                  React.createElement(link.icon, {
                    className: "h-6 w-5 mr-2",
                    "aria-hidden": "true",
                  })}
                <Typography variant="h3">{link.name}</Typography>
                <div className="absolute inset-x-0 bottom-0 border-b-4 border-darkAltButton opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </a>
            </div>
          ))}
          <div className="col-span-1 col-end-7 flex min-h-[40px] items-center justify-center">
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </nav>
  )
}
