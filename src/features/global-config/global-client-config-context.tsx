"use client";
import { createContext, useContext } from "react";

interface GlobalConfigProps {
  speechEnabled: boolean;
}

const GlobalConfigContext = createContext<GlobalConfigProps | null>(null);

interface IConfig {
  speechEnabled?: string;
}

export const GlobalConfigProvider = ({
  config,
  children,
}: {
  config: IConfig;
  children: React.ReactNode;
}) => {
  const speechEnabled = config.speechEnabled
    ? config.speechEnabled === "true"
    : false;

  return (
    <GlobalConfigContext.Provider
      value={{
        speechEnabled,
      }}
    >
      {children}
    </GlobalConfigContext.Provider>
  );
};

export const useGlobalConfigContext = () => {
  const context = useContext(GlobalConfigContext);
  if (!context) {
    throw new Error("GlobalConfigContext is null");
  }

  return context;
};
