import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'system'
  })

  const [systemTheme, setSystemTheme] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (e) => setSystemTheme(e.matches ? 'dark' : 'light')
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  const resolvedTheme = themeMode === 'system' ? systemTheme : themeMode
  const isDarkMode = resolvedTheme === 'dark'

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode)

    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Also update legacy key for other tabs/compatibility
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [themeMode, isDarkMode])

  const toggleTheme = () => {
    // Simple toggle overrides system preference
    setThemeMode((prev) => {
      // If currently dark (resolved), go to light. Else dark.
      return isDarkMode ? 'light' : 'dark'
    })
  }

  const value = {
    isDarkMode,
    toggleTheme,
    themeMode,
    setThemeMode,
    theme: resolvedTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}