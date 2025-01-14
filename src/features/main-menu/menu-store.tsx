import { proxy, useSnapshot } from "valtio";
class Menu {
  public isMenuOpen: boolean = false;

  constructor() {
    this.isMenuOpen = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}

export const menuStore = proxy(new Menu());
// Hook to use the menu state
export const useMenuState = () => {
  //console.log(menuStore.isMenuOpen);
  return useSnapshot(menuStore);
};
