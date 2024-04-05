"use client"

import { CloudUpload, HomeIcon, BookMarked, SpellCheck2 } from "lucide-react"
import { useSession } from "next-auth/react"
import React from "react"

import Typography from "@/components/typography"
import { ThemeSwitch } from "@/features/theme/theme-switch"

interface LinkItem {
  name: string
  href: string
  icon?: React.ElementType
  condition?: (sessionStatus: string) => boolean
}

export const NavBar: React.FC = () => {
  const { data: _session, status } = useSession()

  if (status === "loading") {
    return (
      <nav aria-label="Main navigation" className="m:h-[44px] border-b-4 border-accent bg-backgroundShade">
        {" "}
        <div className="container mx-auto hidden md:block">
          <div className="grid grid-cols-12 gap-2">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="relative col-span-2 flex items-center space-x-2">
                <div className="flex w-full animate-pulse items-center justify-center py-2">
                  <div className="mr-2 h-9 w-5 rounded bg-gray-300"></div>
                  <div className="h-8 w-24 rounded bg-gray-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>
    )
  }

  const links: LinkItem[] = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Prompt Guide", href: "/prompt-guide", icon: BookMarked, condition: status => status === "authenticated" },
    { name: "What's new", href: "/whats-new", icon: CloudUpload, condition: status => status === "authenticated" },
    {
      name: "Factual Errors",
      href: "/hallucinations",
      icon: SpellCheck2,
      condition: status => status === "authenticated",
    },
    // Further links can be added with or without conditions
  ]

  const visibleLinks = links.filter(link => !link.condition || (link.condition && link.condition(status)))

  return (
    <nav aria-label="Main navigation" className="m:h-[44px] block border-b-4 border-accent bg-backgroundShade">
      <div className="container mx-auto hidden md:block">
        <div dir="ltr" className="grid grid-cols-12 gap-2">
          {visibleLinks.map((link, index) => (
            <div key={index} className="relative col-span-2 flex items-center space-x-2">
              <a href={link.href} className="group flex w-full items-center justify-center py-2 hover:bg-altBackground">
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
          <div className="col-span-2 flex min-h-[40px] items-center justify-end">
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </nav>
  )
}
