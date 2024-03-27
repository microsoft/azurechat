"use client"

import { Card } from "@/features/ui/card"
import { useRouter } from "next/navigation"
import React from "react"

const Home: React.FC = () => {
  const router = useRouter()

  const handleRedirectHome = async (): Promise<void> => {
    try {
      await router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Redirect failed:", error)
    }
  }

  return (
    <Card className="items-top justify-left flex h-full flex-1 p-10">
      <div className="flex flex-col">
        {" "}
        <h1 className="text-xl font-semibold">You are not authorised to view this page</h1>
        <p className="mt-5">
          Please{" "}
          <button
            onClick={handleRedirectHome}
            className="text-link hover:text-altButton hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Return Home"
          >
            click here
          </button>{" "}
          to return home.
        </p>
      </div>
    </Card>
  )
}

export default Home
