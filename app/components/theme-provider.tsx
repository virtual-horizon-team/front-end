"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
function DarkReaderSync() {
  const { theme, systemTheme } = useTheme();

  React.useEffect(() => {
    // Dynamically import darkreader only on the client to prevent SSR 'window is not defined' errors
    import("darkreader").then(({ enable, disable, setFetchMethod }) => {
      const activeTheme = theme === 'system' ? systemTheme : theme;
      
      if (activeTheme === "dark") {
        // Use window.fetch to avoid cross-origin font fetching errors
        setFetchMethod(window.fetch);
        
        enable({
          brightness: 100,
          contrast: 110,
          sepia: 0,
          darkSchemeBackgroundColor: "#000000", // Pure black for maximum darkness
          darkSchemeTextColor: "#e8e6e3"
        });
      } else {
        disable();
      }
    }).catch(err => console.error("Failed to load darkreader", err));
  }, [theme, systemTheme]);

  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <DarkReaderSync />
      {children}
    </NextThemesProvider>
  );
}
