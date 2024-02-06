import { useExtensionState } from "../extension-store";

export const ErrorMessages = () => {
  const { formState } = useExtensionState();

  if (formState.errors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {formState.errors.map((error, index) => (
        <div key={index} className="text-red-500">
          {error.message}
        </div>
      ))}
    </div>
  );
};
