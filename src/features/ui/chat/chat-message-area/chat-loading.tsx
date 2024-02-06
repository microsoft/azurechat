import { LoadingIndicator } from "../../loading";

export const ChatLoading = () => {
  return (
    <div className="flex justify-center p-8">
      <LoadingIndicator isLoading={true} />
    </div>
  );
};
