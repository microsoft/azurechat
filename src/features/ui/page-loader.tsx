import { LoadingIndicator } from "./loading";

export const PageLoader = () => {
  return (
    <div className="container max-w-4xl flex items-center justify-center">
      <LoadingIndicator isLoading />
    </div>
  );
};
