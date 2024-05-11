import React from "react"

import Typography from "@/components/typography"
import { MiniMenu } from "@/features/main-menu/mini-menu"
import { AI_NAME, AI_TAGLINE, APP_VANITY_URL } from "@/features/theme/theme-config"
import { QgovSvg } from "@/features/ui/qldgovlogo"
import { QgovMiniSvg } from "@/features/ui/qldgovminilogo"
import { UserComponent } from "@/features/ui/user-login-logout"

const Sidebar: React.FC = () => {
  return (
    <div className="bg-altBackground">
      <div className="container justify-center py-2">
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-2 hidden justify-self-center border-r-2 border-r-accent md:col-span-3 md:block lg:col-span-2">
            <QgovSvg className="hidden scale-75 md:block" />
          </div>
          <div className="col-span-5 px-4 font-meta">
            <Typography variant="h1" className="font-bold tracking-wider text-siteTitle">
              {AI_NAME}
            </Typography>
            <Typography variant="h2" className="hidden whitespace-nowrap text-textMuted md:block">
              {AI_TAGLINE}
            </Typography>
          </div>
          <div className="col-span-5"></div>
        </div>
      </div>
    </div>
  )
}

export const Header: React.FC = () => {
  return (
    <header className="flex w-full flex-col bg-darkbackground text-white">
      <div className="container flex h-14 items-center justify-between">
        <div className="hidden md:grid md:w-full md:grid-cols-12 md:items-center">
          <div className="col-span-2 justify-self-center">
            <Typography variant="span" ariaLabel={"Site domain:" + APP_VANITY_URL}>
              {APP_VANITY_URL}
            </Typography>
          </div>
          <div className="col-span-8 justify-self-center"></div>
          <div className="col-span-2 justify-self-end">
            <UserComponent />
          </div>
        </div>
        <div className="grid w-full grid-cols-12 md:hidden">
          <div className="col-span-4 flex justify-self-center">
            <QgovMiniSvg />
          </div>
          <div className="col-span-4 flex justify-self-center"></div>
          <div className="col-span-4 flex justify-self-end">
            <MiniMenu />
          </div>
        </div>
      </div>
      <Sidebar />
    </header>
  )
}
