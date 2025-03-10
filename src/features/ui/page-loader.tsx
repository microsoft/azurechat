import { LoadingIndicator } from "./loading";

export const PageLoader = () => {
  return (
    <div className="container w-full h-full flex items-center justify-center">
      <LoadingIndicator isLoading />
    </div>
  );
};
