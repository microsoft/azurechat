import { APP_VERSION } from "@/app-global"

import Typography from "@/components/typography"

export const VersionDisplay = (): JSX.Element => {
  return (
    <div className="flex flex-col">
      <Typography variant="h1" className="font-bold">
        Version: {APP_VERSION}
      </Typography>
    </div>
  )
}
