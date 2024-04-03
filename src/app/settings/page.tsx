import { Card, CardHeader, CardTitle, CardDescription } from "@/features/ui/card"

export const dynamic = "force-dynamic"

export default function Home(): JSX.Element {
  return (
    <div className="col-span-5 size-full">
      <div className="grid size-full grid-cols-2 grid-rows-2 justify-center">
        <Card className="col-span-1 w-full p-4">
          <div className="flex h-full flex-col justify-between rounded-lg bg-altBackground text-foreground shadow-sm">
            <CardHeader>
              <CardTitle className="my-2 text-center font-bold">Coming Soon</CardTitle>
            </CardHeader>
            <CardDescription className="px-4">This is a description for the first menu option.</CardDescription>
          </div>
        </Card>
        <Card className="col-span-1 w-full p-4">
          <div className="flex h-full flex-col justify-between rounded-lg bg-altBackground text-foreground shadow-sm">
            <CardHeader>
              <CardTitle className="my-2 text-center font-bold">Coming Soon</CardTitle>
            </CardHeader>
            <CardDescription className="px-4">This is a description for the second menu option.</CardDescription>
          </div>
        </Card>
        <Card className="col-span-1 w-full p-4">
          <div className="flex h-full flex-col justify-between rounded-lg bg-altBackground text-foreground shadow-sm">
            <CardHeader>
              <CardTitle className="my-2 text-center font-bold">Coming Soon</CardTitle>
            </CardHeader>
            <CardDescription className="px-4">This is a description for the third menu option.</CardDescription>
          </div>
        </Card>
        <Card className="col-span-1 w-full p-4">
          <div className="flex h-full flex-col justify-between rounded-lg bg-altBackground text-foreground shadow-sm">
            <CardHeader>
              <CardTitle className="my-2 text-center font-bold">Coming Soon</CardTitle>
            </CardHeader>
            <CardDescription className="px-4">This is a description for the fourth menu option.</CardDescription>
          </div>
        </Card>
      </div>
    </div>
  )
}
