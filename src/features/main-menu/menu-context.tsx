import React, { createContext, useContext, useState } from "react";

interface MenuContextProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

export const MenuContext = createContext<MenuContextProps>({
  isMenuOpen: true,
  toggleMenu: () => {},
});

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <MenuContext.Provider value={{ isMenuOpen, toggleMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenuContext = () => useContext(MenuContext);
