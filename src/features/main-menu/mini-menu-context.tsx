import React, { createContext, useContext, useState } from "react";

interface MiniMenuContextProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

// Create the context
export const MiniMenuContext = createContext<MiniMenuContextProps>({
  isMenuOpen: false, // Set the default state
  toggleMenu: () => {},
});

// Create the provider
export const MiniMenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <MiniMenuContext.Provider value={{ isMenuOpen, toggleMenu }}>
      {children}
    </MiniMenuContext.Provider>
  );
};

// Hook to use the context
export const useMiniMenuContext = () => useContext(MiniMenuContext);


