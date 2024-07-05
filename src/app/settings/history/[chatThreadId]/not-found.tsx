import Typography from "@/components/typography"
import { Card } from "@/features/ui/card"

export default function NotFound(): JSX.Element {
  return (
    <Card className="flex size-full items-center justify-center">
      <div className="container mx-auto flex size-full max-w-xl items-center justify-center gap-2">
        <div className="flex flex-1 flex-col items-start gap-5">
          <Typography variant="h2" className="font-bold">
            Sorry
          </Typography>
          <div className="justify-between">
            <div className="flex items-center gap-2">
              <Typography variant="p" className="text-muted-foreground">
                I wasn&apos;t able to load that conversation
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
