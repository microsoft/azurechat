import { ArrowRightIcon } from "lucide-react"
import React from "react"

import Typography from "@/components/typography"
import { Button } from "@/features/ui/button"
import { Card } from "@/features/ui/card"

const Home: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="flex min-w-[300px] flex-col rounded-md bg-altBackground p-8 text-foreground">
        <Typography variant="h3" className="text-xl font-semibold">
          You are not authorised to view this page
        </Typography>
        <Button asChild variant="link" ariaLabel="Return Home">
          <a href="/">
            Please click here to return home.
            <ArrowRightIcon size={18} />
          </a>
        </Button>
      </Card>
    </div>
  )
}

export default Home
