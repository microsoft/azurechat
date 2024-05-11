import { Card, CardDescription, CardHeader, CardTitle } from "@/features/ui/card"

export const dynamic = "force-dynamic"

export default function Home(): JSX.Element {
  return (
    <Card>
      <div className="flex h-full flex-col justify-between rounded-lg bg-altBackground text-center text-foreground">
        <CardHeader>
          <CardTitle className="my-2 font-bold">Coming Soon</CardTitle>
        </CardHeader>
        <CardDescription className="px-4">Chat history</CardDescription>
      </div>
    </Card>
  )
}
