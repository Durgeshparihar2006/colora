"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Load theme from localStorage on mount
    const settings = localStorage.getItem("userSettings")
    if (settings) {
      const { darkMode: savedDarkMode } = JSON.parse(settings)
      setDarkMode(savedDarkMode)
      applyTheme(savedDarkMode)
    }
  }, [])

  const applyTheme = (isDark: boolean) => {
    // Apply theme to document
    document.documentElement.classList.toggle("dark", isDark)
    
    if (isDark) {
      document.body.style.backgroundColor = '#12141f'
      document.body.style.color = '#ffffff'
      // Add dark mode styles to game content
      document.documentElement.style.setProperty('--game-bg', '#1a1c2b')
      document.documentElement.style.setProperty('--card-bg', '#12141f')
      document.documentElement.style.setProperty('--text-primary', '#ffffff')
      document.documentElement.style.setProperty('--text-secondary', '#94a3b8')
      document.documentElement.style.setProperty('--border-color', '#2a2d3d')
    } else {
      document.body.style.backgroundColor = '#ffffff'
      document.body.style.color = '#000000'
      // Add light mode styles to game content
      document.documentElement.style.setProperty('--game-bg', '#ffffff')
      document.documentElement.style.setProperty('--card-bg', '#ffffff')
      document.documentElement.style.setProperty('--text-primary', '#111827')
      document.documentElement.style.setProperty('--text-secondary', '#4b5563')
      document.documentElement.style.setProperty('--border-color', '#e5e7eb')
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    applyTheme(newDarkMode)

    // Save to localStorage
    const currentSettings = localStorage.getItem("userSettings")
    const settings = currentSettings ? JSON.parse(currentSettings) : {}
    settings.darkMode = newDarkMode
    localStorage.setItem("userSettings", JSON.stringify(settings))
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
} 