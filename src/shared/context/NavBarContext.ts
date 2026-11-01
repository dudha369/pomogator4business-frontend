import { createContext, useContext } from 'react';

interface NavBarContextType {
  setHidden: (hidden: boolean) => void;
}

export const NavBarContext = createContext<NavBarContextType>({
  setHidden: () => {},
});

export const useNavBar = () => useContext(NavBarContext);
