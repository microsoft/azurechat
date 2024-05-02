import { APP_VERSION } from "@/app-global"

export const VersionDisplay = (): JSX.Element => {
  return (
    <div className="flex flex-col">
      <h1 className="text-sm font-bold">Version: {APP_VERSION}</h1>
    </div>
  )
}
