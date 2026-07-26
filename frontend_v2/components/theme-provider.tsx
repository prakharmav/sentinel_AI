"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type Theme = "sentinel-dark" | "government" | "light"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "sentinel-dark",
  storageKey = "sentinelai-theme",
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={false}
      disableTransitionOnChange
      storageKey={storageKey}
      themes={["sentinel-dark", "government", "light"]}
    >
      {children}
    </NextThemesProvider>
  )
}

export { type Theme }
