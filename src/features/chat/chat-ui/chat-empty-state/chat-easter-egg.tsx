"use client"

import { Heart } from "lucide-react"
import { getSession } from "next-auth/react"
import React, { useState, useEffect } from "react"

import Typography from "@/components/typography"

export const EasterEgg = (): React.JSX.Element => {
  const [isEasterEggDay, setIsEasterEggDay] = useState(false)

  useEffect(() => {
    const checkEasterEggDay = async (): Promise<boolean> => {
      const session = await getSession()
      return session?.user?.tenantId === "c8b3c81f-0928-458f-a835-a74452e3b706"
    }

    checkEasterEggDay()
      .then(isEggDay => setIsEasterEggDay(isEggDay))
      .catch(_ => setIsEasterEggDay(false))
  }, [])

  if (!isEasterEggDay) {
    return <></>
  }
  return (
    <>
      <div className="jusity-self-center flex flex-col items-center gap-1">
        <div className={"flex items-center justify-center text-altButton"}>
          <Heart className="size-8" fill="currentColor" />
          <Typography variant="span" className="mx-2 text-center text-xs">
            Made with love by Keith Oak, Rahul Shokeen, Ella Salehi, Fred Delage, Bruno Piovan, Jay Sindorff, the
            Queensland Government Data and AI Unit &amp; supervised by Obi Wan Kenobi
          </Typography>
          <Heart className="size-8" fill="currentColor" />
        </div>
      </div>
    </>
  )
}

export default EasterEgg
