import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@radix-ui/react-toast";
import { createContext, useContext } from "react";

interface GlobalErrorProps {
  showError: (error: string, reload?: () => void) => void;
}

const GlobalErrorContext = createContext<GlobalErrorProps | null>(null);

export const GlobalErrorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const showError = (error: string, reload?: () => void) => {
    toast({
      variant: "destructive",
      description: error,
      action: reload ? (
        <ToastAction
          altText="Try again"
          onClick={() => {
            reload();
          }}
        >
          Try again
        </ToastAction>
      ) : undefined,
    });
  };

  return (
    <GlobalErrorContext.Provider
      value={{
        showError,
      }}
    >
      {children}
    </GlobalErrorContext.Provider>
  );
};

export const useGlobalErrorContext = () => {
  const context = useContext(GlobalErrorContext);
  if (!context) {
    throw new Error("GlobalErrorContext is null");
  }

  return context;
};
