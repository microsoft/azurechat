import { LoadingIndicator } from "./loading"

export const PageLoader = (): JSX.Element => {
  return (
    <div className="col-span-12 size-full">
      <div className="flex size-full items-center justify-center">
        <LoadingIndicator isLoading />
      </div>
    </div>
  )
}
