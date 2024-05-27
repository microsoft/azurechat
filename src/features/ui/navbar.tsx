"use client"

import { CloudUpload, HomeIcon, BookMarked, SpellCheck2, UserRoundCog } from "lucide-react"
import { Session } from "next-auth"
import { useSession } from "next-auth/react"
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
  { name: "Home", href: "/", icon: HomeIcon, condition: "unauthenticated" },
  { name: "Settings", href: "/settings", icon: UserRoundCog, condition: "authenticated" },
  { name: "Prompt Guide", href: "/prompt-guide", icon: BookMarked, condition: "authenticated" },
  { name: "What's new", href: "/whats-new", icon: CloudUpload, condition: "authenticated" },
  { name: "Factual Errors", href: "/hallucinations", icon: SpellCheck2, condition: "authenticated" },
  // Further links can be added with or without conditions
]

const validateCondition = (link: LinkItem) => (session: Session | null) => {
  if (link.condition === "authenticated" && !session?.user) return false
  return true
}

const placeholders = links.filter(link => link.condition).map(link => ({ name: link.name }))

export const NavBar: React.FC = () => {
  const { data: session, status } = useSession()

  const visibleLinks = links.filter(link => !link.condition || validateCondition(link)(session))

  return (
    <nav aria-label="Main navigation" className="m:h-[44px] border-b-4 border-accent bg-backgroundShade">
      <div className="container mx-auto hidden md:block">
        <div dir="ltr" className="justify-right grid grid-cols-12">
          {status === "loading"
            ? placeholders.map(link => (
                <div key={link.name} className="relative col-span-2 flex items-center space-x-2">
                  <div className="flex w-full animate-pulse items-center justify-center p-2">
                    <div className="mr-2 h-8 w-5 rounded bg-gray-300"></div>
                    <div className="h-8 w-24 rounded bg-gray-300"></div>
                  </div>
                </div>
              ))
            : visibleLinks.map(link => (
                <div key={link.name} className="relative col-span-2 flex items-center space-x-2 hover:bg-altBackground">
                  <a href={link.href} className="group flex w-full items-center justify-center p-2">
                    {link.icon &&
                      React.createElement(link.icon, {
                        className: "h-8 w-5 mr-2",
                        "aria-hidden": "true",
                      })}
                    <Typography variant="h3">{link.name}</Typography>
                    <div className="absolute inset-x-0 bottom-0 border-b-4 border-darkAltButton opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  </a>
                </div>
              ))}
          {!session && status !== "loading" && <div className="col-span-8"></div>}
          <div className="relative col-span-2 flex min-h-[40px] items-center justify-center">
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </nav>
  )
}
