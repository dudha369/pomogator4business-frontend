import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { getStoredValue, setStoredValue } from "@/shared/telegram/storage";

export type ColorScheme = "blue" | "purple" | "green" | "orange" | "pink";

export const COLOR_SCHEMES: { value: ColorScheme; swatch: string }[] = [
  { value: "blue", swatch: "#2f88ff" },
  { value: "purple", swatch: "#7b5cff" },
  { value: "green", swatch: "#2fb350" },
  { value: "orange", swatch: "#e08600" },
  { value: "pink", swatch: "#e0245e" },
];

const STORAGE_KEY = "color_scheme";
const DEFAULT_SCHEME: ColorScheme = "blue";

interface ColorSchemeContextValue {
  scheme: ColorScheme;
  setScheme: (scheme: ColorScheme) => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextValue>({
  scheme: DEFAULT_SCHEME,
  setScheme: () => {},
});

export const useColorScheme = () => useContext(ColorSchemeContext);

function applyScheme(scheme: ColorScheme) {
  document.documentElement.dataset.accent = scheme;
}

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setSchemeState] = useState<ColorScheme>(DEFAULT_SCHEME);

  useEffect(() => {
    getStoredValue(STORAGE_KEY).then((stored) => {
      const resolved =
        stored && COLOR_SCHEMES.some((s) => s.value === stored)
          ? (stored as ColorScheme)
          : DEFAULT_SCHEME;
      setSchemeState(resolved);
      applyScheme(resolved);
    });
  }, []);

  function setScheme(next: ColorScheme) {
    setSchemeState(next);
    applyScheme(next);
    setStoredValue(STORAGE_KEY, next).catch(() => {});
  }

  return (
    <ColorSchemeContext.Provider value={{ scheme, setScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}