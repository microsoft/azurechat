import { LoadingIndicator } from "./loading"

export const PageLoader = (): JSX.Element => {
  return (
    <div className="container flex size-full max-w-4xl items-center justify-center">
      <LoadingIndicator isLoading />
    </div>
  )
}
