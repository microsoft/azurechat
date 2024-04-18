import { appVersionDetails } from "./app-version"

export const UpdateIndicatorAction = async (): Promise<JSX.Element | null> => {
  const appVersion = await appVersionDetails()

  if (!appVersion.isOutdated) {
    return null
  }
  return (
    <div className="absolute left-0 top-0  -translate-x-0.5 -translate-y-0.5 rounded-full bg-red-400">
      <div className="size-3  animate-ping rounded-full bg-red-600 "></div>
    </div>
  )
}
