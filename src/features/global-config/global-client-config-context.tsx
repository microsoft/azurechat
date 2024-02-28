"use client";
import { createContext, useContext } from "react";

interface IConfig {
}

const GlobalConfigContext = createContext<IConfig | null>(null);


export const GlobalConfigProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {

  return (
    <GlobalConfigContext.Provider
      value={{}}
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