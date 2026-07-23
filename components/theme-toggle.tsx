"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "./theme-provider"

export function ThemeToggle({ className }: { className?: string }) {
  const { toggle } = useTheme()

  return (
    <button onClick={toggle} type="button" className={className}>
      <Sun className="size-4" />
      <Moon className="size-4" />
    </button>
  )
}

export function ThemeToggleMinimal({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()

  return (
    <button onClick={toggle} type="button" className={className}>
      {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  )
}