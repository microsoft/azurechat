import { proxy, useSnapshot } from "valtio";
class Menu {
  public isMenuOpen: boolean;

  constructor() {
    this.isMenuOpen = true;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}

export const menuStore = proxy(new Menu());
// Hook to use the menu state
export const useMenuState = () => {
  return useSnapshot(menuStore);
};
