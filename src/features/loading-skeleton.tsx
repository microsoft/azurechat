export const LoadingSkeleton = (): JSX.Element => {
  return (
    <div className="col-span-full flex size-full items-center justify-center bg-pattern-bg bg-repeat sm:col-span-4 md:col-span-5 lg:col-span-4 xl:col-span-5">
      <div className="loader font-alert">Loading...</div>
    </div>
  )
}
